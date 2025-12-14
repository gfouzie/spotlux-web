'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserTeamFull } from '@/types/team';
import { userTeamsApi } from '@/api/userTeams';
import { useProfileSport } from '@/contexts/ProfileSportContext';
import EmptyState from './EmptyState';
import UserTeamsList from './UserTeamsList';
import AddUserTeamModal from './AddUserTeamModal';
import AddButton from '@/components/common/AddButton';

interface UserTeamsProfileContentProps {
  isOwner?: boolean; // If true, shows edit/delete buttons. Defaults to true for backward compatibility
  userId?: number; // Optional: if provided, fetches teams for this user
}

export default function UserTeamsProfileContent({
  isOwner = true,
  userId,
}: UserTeamsProfileContentProps) {
  const { refreshSports } = useProfileSport();
  const [teamsBySport, setTeamsBySport] = useState<
    Record<string, UserTeamFull[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<UserTeamFull | null>(null);

  const loadTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch teams for the specified user or current authenticated user
      const teams = userId
        ? await userTeamsApi.getUserTeamsByUserIdFull(userId)
        : await userTeamsApi.getUserTeamsFull();
      setTeamsBySport(teams);
    } catch (err) {
      console.error('Failed to load user teams:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleSuccess = async () => {
    // Refresh teams list and sports context
    await loadTeams();
    await refreshSports();
  };

  const handleAddTeam = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  const handleEditTeam = (userTeam: UserTeamFull) => {
    setEditingTeam(userTeam);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
  };

  const handleDeleteTeam = async (userTeam: UserTeamFull) => {
    const teamName = userTeam.team.name;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${teamName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await userTeamsApi.deleteUserTeam(userTeam.id);
      await handleSuccess();
    } catch (err) {
      console.error('Failed to delete user team:', err);
      alert('Failed to delete team. Please try again.');
    }
  };

  const hasTeams = Object.keys(teamsBySport).length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Header with Add Button */}
      {hasTeams && (
        <div className="flex items-center justify-between">
          <h2>Teams</h2>
          {isOwner && (
            <AddButton onClick={handleAddTeam} ariaLabel="Add team" />
          )}
        </div>
      )}

      {hasTeams ? (
        <UserTeamsList
          teamsBySport={teamsBySport}
          onEdit={isOwner ? handleEditTeam : undefined}
          onDelete={isOwner ? handleDeleteTeam : undefined}
        />
      ) : (
        <EmptyState onAddTeam={isOwner ? handleAddTeam : undefined} />
      )}

      {isOwner && (
        <AddUserTeamModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          editingUserTeam={editingTeam}
        />
      )}
    </>
  );
}
