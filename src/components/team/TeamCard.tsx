'use client';

import React from 'react';
import Image from 'next/image';
import { Team } from '@/types/team';

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
}

/**
 * Get initials from team name for placeholder
 */
const getTeamInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words?.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words?.[0]?.[0] + words?.[words?.length - 1]?.[0]).toUpperCase();
};

/**
 * TeamCard component displays a team with its profile picture or initials
 * Example usage for displaying teams with their profile images
 */
const TeamCard: React.FC<TeamCardProps> = ({ team, onClick }) => {
  const initials = getTeamInitials(team.name);

  return (
    <div
      className="bg-component-col rounded-lg p-4 hover:bg-bg-col/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {/* Team Profile Picture or Initials */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-bg-col">
          {team?.profileImageUrl ? (
            <Image
              src={team.profileImageUrl}
              alt={`${team.name} logo`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent-col/20">
              <span className="text-lg lg:text-xl font-semibold text-text-col">
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Team Info */}
        <div className="flex-1 min-w-0">
          <h3 className="truncate">
            {team.name}
          </h3>
          <p className="text-sm text-text-col/60 capitalize">{team.sport}</p>
          {team.level && (
            <p className="text-xs text-text-col/40">{team.level}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
