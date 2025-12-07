'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { teamsApi } from '@/api/teams';
import { Team } from '@/types/team';
import TeamCard from '@/components/team/TeamCard';

const TEAMS_PER_PAGE = 10;

const TeamsList: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const sports = [
    'all',
    'basketball',
    'soccer',
    'football',
    'baseball',
    'hockey',
    'volleyball',
    'tennis',
    'golf',
  ];

  const loadTeams = useCallback(
    async (currentOffset: number, isNewFilter: boolean = false) => {
      try {
        if (isNewFilter) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const params = {
          sport: selectedSport === 'all' ? undefined : selectedSport,
          offset: currentOffset,
          limit: TEAMS_PER_PAGE,
        };

        const newTeams = await teamsApi.getTeams(params);

        if (isNewFilter) {
          setTeams(newTeams);
        } else {
          setTeams((prev) => [...prev, ...newTeams]);
        }

        // If we got fewer teams than requested, there are no more teams to load
        setHasMore(newTeams?.length === TEAMS_PER_PAGE);
        setOffset(currentOffset + newTeams?.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load teams');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedSport]
  );

  // Reset and load teams when sport filter changes
  useEffect(() => {
    setTeams([]);
    setOffset(0);
    setHasMore(true);
    loadTeams(0, true);
  }, [selectedSport, loadTeams]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadTeams(offset, false);
    }
  };

  const handleRefresh = () => {
    setTeams([]);
    setOffset(0);
    setHasMore(true);
    loadTeams(0, true);
  };

  return (
    <div className="bg-component-col rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-col">Teams List</h2>
          <p className="text-text-col/60 text-sm mt-1">
            {teams?.length} team{teams?.length !== 1 ? 's' : ''}{' '}
            {selectedSport !== 'all' && `in ${selectedSport}`}
            {hasMore && ' (more available)'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-accent-col text-text-col rounded-md hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Sport Filter */}
      <div className="mb-6">
        <label
          htmlFor="sport-filter"
          className="block text-sm font-medium text-text-col mb-2"
        >
          Filter by Sport
        </label>
        <select
          id="sport-filter"
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          disabled={loading}
          className="w-full max-w-xs px-3 py-2 bg-bg-col text-text-col border border-component-col rounded-md focus:outline-none focus:ring-2 focus:ring-accent-col capitalize disabled:opacity-50"
        >
          {sports.map((sport) => (
            <option key={sport} value={sport} className="capitalize">
              {sport === 'all' ? 'All Sports' : sport}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Teams Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-col/60">
            {selectedSport === 'all'
              ? 'No teams found. Create your first team above!'
              : `No teams found for ${selectedSport}. Try a different sport or create one!`}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams?.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={() => console.log('Team clicked:', team)}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-accent-col text-text-col rounded-md hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-text-col border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More Teams</span>
                )}
              </button>
            </div>
          )}

          {/* End of Results Message */}
          {!hasMore && teams?.length > 0 && (
            <div className="text-center mt-6">
              <p className="text-text-col/60 text-sm">
                You&apos;ve reached the end of the list
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeamsList;
