'use client';

import { HighlightMatchup } from '@/types/matchup';
import MatchupCard from '@/components/matchup/MatchupCard';

interface MatchupItemProps {
  matchup: HighlightMatchup;
  isActive: boolean;
}

/**
 * Matchup voting item in unified feed
 * Uses existing MatchupCard component
 */
export default function MatchupItem({ matchup, isActive }: MatchupItemProps) {
  return (
    <div className="w-full h-full">
      <MatchupCard matchup={matchup} isActive={isActive} />
    </div>
  );
}
