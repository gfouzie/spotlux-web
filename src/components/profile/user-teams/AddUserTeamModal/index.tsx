'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { League, Team, Position, UserTeamFull } from '@/types/team';
import { userTeamsApi } from '@/api/userTeams';
import { ArrowLeft } from 'iconoir-react';
import UserTeamFormScreen from './UserTeamFormScreen';
import LeagueSelectScreen from './LeagueSelectScreen';
import LeagueCreateScreen from './LeagueCreateScreen';
import TeamSelectScreen from './TeamSelectScreen';
import TeamCreateScreen from './TeamCreateScreen';
import PositionSelectScreen from './PositionSelectScreen';
import PositionCreateScreen from './PositionCreateScreen';
import {
  ModalScreen,
  initialFormData,
  initialLeagueFormData,
  initialTeamFormData,
  initialPositionFormData,
  UserTeamFormData,
  LeagueFormData,
  TeamFormData,
  PositionFormData,
} from './types';

interface AddUserTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUserTeam?: UserTeamFull | null;
}

const AddUserTeamModal: React.FC<AddUserTeamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingUserTeam = null,
}) => {
  const [currentScreen, setCurrentScreen] = useState<ModalScreen>('main');
  const [screenHistory, setScreenHistory] = useState<ModalScreen[]>([]);
  const [formData, setFormData] = useState<UserTeamFormData>(initialFormData);
  const [leagueFormData, setLeagueFormData] = useState<LeagueFormData>(
    initialLeagueFormData
  );
  const [teamFormData, setTeamFormData] =
    useState<TeamFormData>(initialTeamFormData);
  const [positionFormData, setPositionFormData] = useState<PositionFormData>(
    initialPositionFormData
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate form when editing
  useEffect(() => {
    if (editingUserTeam && isOpen) {
      setFormData({
        sport: editingUserTeam.sport,
        country: editingUserTeam.league?.country || '',
        league: editingUserTeam.league || null,
        team: editingUserTeam.team,
        yearJoined: editingUserTeam.yearJoined,
        yearLeft: editingUserTeam.yearLeft || '',
        isCurrentTeam: !editingUserTeam.yearLeft,
        position: editingUserTeam.position || null,
        jerseyNumber: editingUserTeam.jerseyNumber ?? '',
      });
    } else if (isOpen) {
      // Reset to initial state when creating new
      setFormData(initialFormData);
    }
  }, [editingUserTeam, isOpen]);

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setCurrentScreen('main');
    setScreenHistory([]);
    setFormData(initialFormData);
    setLeagueFormData(initialLeagueFormData);
    setTeamFormData(initialTeamFormData);
    setPositionFormData(initialPositionFormData);
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  // Navigation helpers
  const navigateTo = (screen: ModalScreen) => {
    setScreenHistory([...screenHistory, currentScreen]);
    setCurrentScreen(screen);
  };

  const navigateBack = () => {
    if (screenHistory.length > 0) {
      const previousScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory(screenHistory.slice(0, -1));
      setCurrentScreen(previousScreen);
    }
  };

  // Form update handlers
  const updateFormData = (data: Partial<UserTeamFormData>) => {
    setFormData({ ...formData, ...data });
  };

  const updateLeagueFormData = (data: Partial<LeagueFormData>) => {
    setLeagueFormData({ ...leagueFormData, ...data });
  };

  const updateTeamFormData = (data: Partial<TeamFormData>) => {
    setTeamFormData({ ...teamFormData, ...data });
  };

  const updatePositionFormData = (data: Partial<PositionFormData>) => {
    setPositionFormData({ ...positionFormData, ...data });
  };

  // Entity creation handlers
  const handleLeagueSelected = (league: League) => {
    updateFormData({ league });
    setLeagueFormData(initialLeagueFormData); // Reset league form
    navigateBack();
  };

  const handleLeagueCreated = (league: League) => {
    updateFormData({ league });
    setLeagueFormData(initialLeagueFormData); // Reset league form
    // Navigate back to league select, then back to main
    setCurrentScreen('main');
    setScreenHistory([]);
  };

  const handleTeamSelected = (team: Team) => {
    updateFormData({ team });
    setTeamFormData(initialTeamFormData); // Reset team form
    navigateBack();
  };

  const handleTeamCreated = (team: Team) => {
    updateFormData({ team });
    setTeamFormData(initialTeamFormData); // Reset team form
    // Navigate back to main
    setCurrentScreen('main');
    setScreenHistory([]);
  };

  const handlePositionSelected = (position: Position) => {
    updateFormData({ position });
    setPositionFormData(initialPositionFormData); // Reset position form
    navigateBack();
  };

  const handlePositionCreated = (position: Position) => {
    updateFormData({ position });
    setPositionFormData(initialPositionFormData); // Reset position form
    // Navigate back to main
    setCurrentScreen('main');
    setScreenHistory([]);
  };

  const handlePositionSkipped = () => {
    updateFormData({ position: null });
    navigateBack();
  };

  // Final submission
  const handleSubmit = async () => {
    if (!formData.team || !formData.league) {
      return;
    }

    setIsSubmitting(true);

    try {
      const teamData = {
        teamId: formData.team.id,
        sport: formData.sport,
        yearJoined: formData.yearJoined as number,
        yearLeft: formData.isCurrentTeam
          ? null
          : (formData.yearLeft as number) || null,
        positionId: formData.position?.id || null,
        jerseyNumber:
          formData.jerseyNumber !== ''
            ? (formData.jerseyNumber as number)
            : null,
      };

      if (editingUserTeam) {
        // Update existing user team
        await userTeamsApi.updateUserTeam(editingUserTeam.id, teamData);
      } else {
        // Create new user team
        await userTeamsApi.createUserTeam(teamData);
      }

      onSuccess();
      handleClose();
    } catch (err) {
      console.error(
        `Failed to ${editingUserTeam ? 'update' : 'create'} user team:`,
        err
      );
      // Error handling is done in the form screen
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine modal title and show back button
  const getModalTitle = () => {
    switch (currentScreen) {
      case 'main':
        return editingUserTeam ? 'Edit Team' : 'Add Team';
      case 'league-select':
        return 'Select League';
      case 'league-create':
        return 'Create League';
      case 'team-select':
        return 'Select Team';
      case 'team-create':
        return 'Create Team';
      case 'position-select':
        return 'Select Position';
      case 'position-create':
        return 'Create Position';
      default:
        return editingUserTeam ? 'Edit Team' : 'Add Team';
    }
  };

  const showBackButton = currentScreen !== 'main';

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return (
          <UserTeamFormScreen
            formData={formData}
            onFormChange={updateFormData}
            onNavigateToLeagueSelect={() => navigateTo('league-select')}
            onNavigateToTeamSelect={() => navigateTo('team-select')}
            onNavigateToPositionSelect={() => navigateTo('position-select')}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEditing={!!editingUserTeam}
          />
        );

      case 'league-select':
        return (
          <LeagueSelectScreen
            sport={formData.sport}
            country={formData.country}
            onSelect={handleLeagueSelected}
            onCreateNew={() => navigateTo('league-create')}
          />
        );

      case 'league-create':
        return (
          <LeagueCreateScreen
            sport={formData.sport}
            country={formData.country}
            formData={leagueFormData}
            onFormChange={updateLeagueFormData}
            onCreate={handleLeagueCreated}
          />
        );

      case 'team-select':
        if (!formData.league) {
          navigateBack();
          return null;
        }
        return (
          <TeamSelectScreen
            sport={formData.sport}
            country={formData.country}
            league={formData.league}
            onSelect={handleTeamSelected}
            onCreateNew={() => navigateTo('team-create')}
          />
        );

      case 'team-create':
        if (!formData.league) {
          navigateBack();
          return null;
        }
        return (
          <TeamCreateScreen
            sport={formData.sport}
            league={formData.league}
            formData={teamFormData}
            onFormChange={updateTeamFormData}
            onCreate={handleTeamCreated}
          />
        );

      case 'position-select':
        return (
          <PositionSelectScreen
            sport={formData.sport}
            onSelect={handlePositionSelected}
            onCreateNew={() => navigateTo('position-create')}
            onSkip={handlePositionSkipped}
          />
        );

      case 'position-create':
        return (
          <PositionCreateScreen
            sport={formData.sport}
            formData={positionFormData}
            onFormChange={updatePositionFormData}
            onCreate={handlePositionCreated}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      showFooter={false}
      title={
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={navigateBack}
              className="cursor-pointer p-1 hover:bg-bg-col/50 rounded transition-colors -ml-2"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span>{getModalTitle()}</span>
        </div>
      }
    >
      <div className="min-h-[400px] max-h-[600px] overflow-y-auto p-1">
        {renderScreen()}
      </div>
    </Modal>
  );
};

export default AddUserTeamModal;
