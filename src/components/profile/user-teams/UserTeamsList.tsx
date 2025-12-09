'use client';

import React from 'react';
import { UserTeamFull } from '@/types/team';
import UserTeamCard from './UserTeamCard';
import { useProfileSport } from '@/contexts/ProfileSportContext';

interface UserTeamsListProps {
  teamsBySport: Record<string, UserTeamFull[]>;
  onEdit?: (userTeam: UserTeamFull) => void;
  onDelete?: (userTeam: UserTeamFull) => void;
}

const UserTeamsList: React.FC<UserTeamsListProps> = ({ teamsBySport, onEdit, onDelete }) => {
  const { selectedSport } = useProfileSport();

  // Filter teams by selected sport
  const teams = selectedSport ? teamsBySport[selectedSport] || [] : [];

  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-text-col/60">
        No teams found for {selectedSport}.
      </div>
    );
  }

  return (
    <div className="bg-card-col rounded-lg p-4">
      {teams.map((userTeam) => (
        <UserTeamCard
          key={userTeam.id}
          userTeam={userTeam}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default UserTeamsList;
