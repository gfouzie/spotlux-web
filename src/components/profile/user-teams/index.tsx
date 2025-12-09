'use client';

import React, { useState, useEffect } from 'react';
import { UserTeamFull } from '@/types/team';
import { userTeamsApi } from '@/api/userTeams';
import { useProfileSport } from '@/contexts/ProfileSportContext';
import EmptyState from './EmptyState';
import UserTeamsList from './UserTeamsList';
import AddUserTeamModal from './AddUserTeamModal';

export default function UserTeamsProfileContent() {
  const { refreshSports } = useProfileSport();
  const [teamsBySport, setTeamsBySport] = useState<
    Record<string, UserTeamFull[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<UserTeamFull | null>(null);

  const loadTeams = async () => {
    setIsLoading(true);
    try {
      const teams = await userTeamsApi.getUserTeamsFull();
      setTeamsBySport(teams);
    } catch (err) {
      console.error('Failed to load user teams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

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
          <h2 className="text-2xl font-bold text-text-col">Teams</h2>
          <button
            onClick={handleAddTeam}
            className="cursor-pointer flex items-center justify-center w-7 h-7 rounded-lg bg-accent-col text-text-col hover:opacity-80 transition-opacity"
            aria-label="Add team"
          >
            <span className="text-xl font-semibold">+</span>
          </button>
        </div>
      )}

      {hasTeams ? (
        <UserTeamsList
          teamsBySport={teamsBySport}
          onEdit={handleEditTeam}
          onDelete={handleDeleteTeam}
        />
      ) : (
        <EmptyState onAddTeam={handleAddTeam} />
      )}

      <AddUserTeamModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        editingUserTeam={editingTeam}
      />
    </>
  );
}
