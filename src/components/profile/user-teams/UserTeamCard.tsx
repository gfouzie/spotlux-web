'use client';

import React from 'react';
import { UserTeamFull } from '@/types/team';
import Image from 'next/image';
import { EditPencil, Trash } from 'iconoir-react';

interface UserTeamCardProps {
  userTeam: UserTeamFull;
  onEdit?: (userTeam: UserTeamFull) => void;
  onDelete?: (userTeam: UserTeamFull) => void;
}

const UserTeamCard: React.FC<UserTeamCardProps> = ({ userTeam, onEdit, onDelete }) => {
  const { team, league, position, yearJoined, yearLeft, jerseyNumber } = userTeam;

  // Format the year range
  const yearRange = yearLeft
    ? `${yearJoined} - ${yearLeft}`
    : `${yearJoined} - Present`;

  // Format position and jersey
  const positionText = position
    ? `${position.name}${jerseyNumber !== null ? ` (#${jerseyNumber})` : ''}`
    : jerseyNumber !== null
    ? `#${jerseyNumber}`
    : null;

  // Format league and level
  const leagueText = league
    ? `${league.name}${team.level ? ` • ${team.level}` : ''}`
    : team.level || null;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-bg-col/50 last:border-b-0">
      {/* Team Logo */}
      <div className="flex-shrink-0">
        {team.profileImageUrl ? (
          <div className="w-14 h-14 rounded-full overflow-hidden">
            <Image
              src={team.profileImageUrl}
              alt={team.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-bg-col flex items-center justify-center text-text-col/40 font-semibold">
            {team.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Team Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-semibold text-text-col truncate">
          {team.name}
        </h4>
        {leagueText && (
          <p className="text-sm text-text-col/70 mt-1">
            {leagueText}
          </p>
        )}
        {positionText && (
          <p className="text-sm text-text-col/70 mt-1">
            {positionText}
          </p>
        )}
        <p className="text-sm text-text-col/50 mt-1">
          {yearRange}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(userTeam)}
            className="cursor-pointer p-2 rounded-lg text-text-col/60 hover:text-text-col hover:bg-bg-col/50 transition-colors"
            aria-label="Edit team"
          >
            <EditPencil className="w-5 h-5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(userTeam)}
            className="cursor-pointer p-2 rounded-lg text-text-col/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            aria-label="Delete team"
          >
            <Trash className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default UserTeamCard;
