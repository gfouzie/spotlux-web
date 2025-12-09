'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { League } from '@/types/team';
import { leaguesApi } from '@/api/leagues';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Search, Plus } from 'iconoir-react';

interface LeagueSelectScreenProps {
  sport: string;
  country: string;
  onSelect: (league: League) => void;
  onCreateNew: () => void;
}

const LeagueSelectScreen: React.FC<LeagueSelectScreenProps> = ({
  sport,
  country,
  onSelect,
  onCreateNew,
}) => {
  const [searchText, setSearchText] = useState('');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  const searchLeagues = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await leaguesApi.getLeagues({
          sport,
          country,
          searchText: query || undefined,
          limit: 20,
        });
        setLeagues(results);
      } catch (err) {
        setError('Failed to load leagues');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [sport, country]
  );

  // Initial load
  useEffect(() => {
    searchLeagues('');
  }, [searchLeagues]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLeagues(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, searchLeagues]);

  const formatLeagueLocation = (league: League) => {
    const parts = [league.city, league.state, league.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          placeholder="Search leagues..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Create New Button */}
      <div className="mb-4">
        <Button
          variant="secondary"
          onClick={onCreateNew}
          className="w-full"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New League
        </Button>
      </div>

      {/* League List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && leagues.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent-col border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 text-sm">{error}</div>
        ) : leagues.length === 0 ? (
          <div className="text-center py-8 text-text-col/60 text-sm">
            No leagues found. Create a new one!
          </div>
        ) : (
          <div className="space-y-2">
            {leagues.map((league) => (
              <button
                key={league.id}
                onClick={() => onSelect(league)}
                className="cursor-pointer w-full text-left p-4 rounded-lg bg-bg-col hover:bg-bg-col/50 transition-colors border border-text-col/10"
              >
                <div className="font-medium text-text-col">
                  {league.name}
                  {league.abbreviation && (
                    <span className="text-text-col/60 ml-2">({league.abbreviation})</span>
                  )}
                </div>
                {formatLeagueLocation(league) && (
                  <div className="text-sm text-text-col/60 mt-1">
                    {formatLeagueLocation(league)}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeagueSelectScreen;
