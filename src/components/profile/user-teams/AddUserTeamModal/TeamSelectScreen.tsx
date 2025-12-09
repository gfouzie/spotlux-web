'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Team, League } from '@/types/team';
import { teamsApi } from '@/api/teams';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Search, Plus } from 'iconoir-react';
import Image from 'next/image';

interface TeamSelectScreenProps {
  sport: string;
  country: string;
  league: League;
  onSelect: (team: Team) => void;
  onCreateNew: () => void;
}

const TeamSelectScreen: React.FC<TeamSelectScreenProps> = ({
  sport,
  country,
  league,
  onSelect,
  onCreateNew,
}) => {
  const [searchText, setSearchText] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  const searchTeams = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await teamsApi.getTeams({
          sport,
          country,
          leagueId: league.id,
          searchText: query || undefined,
          limit: 20,
        });
        setTeams(results);
      } catch (err) {
        setError('Failed to load teams');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [sport, country, league.id]
  );

  // Initial load
  useEffect(() => {
    searchTeams('');
  }, [searchTeams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      searchTeams(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, searchTeams]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          placeholder="Search teams..."
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
          Create New Team
        </Button>
      </div>

      {/* Team List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && teams.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent-col border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 text-sm">{error}</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-8 text-text-col/60 text-sm">
            No teams found. Create a new one!
          </div>
        ) : (
          <div className="space-y-2">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => onSelect(team)}
                className="cursor-pointer w-full text-left p-4 rounded-lg bg-bg-col hover:bg-bg-col/50 transition-colors border border-text-col/10 flex items-center gap-3"
              >
                {/* Team Logo */}
                {team.profileImageUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={team.profileImageUrl}
                      alt={team.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-bg-col border border-text-col/20 flex items-center justify-center text-text-col/40 font-semibold flex-shrink-0">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Team Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-col truncate">
                    {team.name}
                  </div>
                  {team.level && (
                    <div className="text-sm text-text-col/60 mt-1">
                      {team.level}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSelectScreen;
