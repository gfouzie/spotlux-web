'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Position } from '@/types/team';
import { positionsApi } from '@/api/positions';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Search, Plus } from 'iconoir-react';

interface PositionSelectScreenProps {
  sport: string;
  onSelect: (position: Position) => void;
  onCreateNew: () => void;
  onSkip: () => void;
}

const PositionSelectScreen: React.FC<PositionSelectScreenProps> = ({
  sport,
  onSelect,
  onCreateNew,
  onSkip,
}) => {
  const [searchText, setSearchText] = useState('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  const searchPositions = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await positionsApi.getPositions({
          sport,
          searchText: query || undefined,
          limit: 20,
        });
        setPositions(results);
      } catch (err) {
        setError('Failed to load positions');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [sport]
  );

  // Initial load
  useEffect(() => {
    searchPositions('');
  }, [searchPositions]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPositions(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, searchPositions]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          placeholder="Search positions..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Action Buttons */}
      <div className="mb-4 space-y-2">
        <Button
          variant="secondary"
          onClick={onCreateNew}
          className="w-full"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Position
        </Button>
        <Button
          variant="secondary"
          onClick={onSkip}
          className="w-full"
        >
          Skip (No Position)
        </Button>
      </div>

      {/* Position List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && positions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent-col border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 text-sm">{error}</div>
        ) : positions.length === 0 ? (
          <div className="text-center py-8 text-text-col/60 text-sm">
            No positions found. Create a new one!
          </div>
        ) : (
          <div className="space-y-2">
            {positions.map((position) => (
              <button
                key={position.id}
                onClick={() => onSelect(position)}
                className="cursor-pointer w-full text-left p-4 rounded-lg bg-bg-col hover:bg-bg-col/50 transition-colors border border-text-col/10"
              >
                <div className="font-medium text-text-col">
                  {position.name}
                  {position.abbreviation && (
                    <span className="text-text-col/60 ml-2">({position.abbreviation})</span>
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

export default PositionSelectScreen;
