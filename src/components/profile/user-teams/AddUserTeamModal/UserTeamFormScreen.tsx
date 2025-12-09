'use client';

import React, { useState, useEffect } from 'react';
import { sportsApi } from '@/api/sports';
import { countriesApi } from '@/api/countries';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import NavigationInput from '@/components/common/NavigationInput';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import { UserTeamFormData } from './types';

interface UserTeamFormScreenProps {
  formData: UserTeamFormData;
  onFormChange: (data: Partial<UserTeamFormData>) => void;
  onNavigateToLeagueSelect: () => void;
  onNavigateToTeamSelect: () => void;
  onNavigateToPositionSelect: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

const UserTeamFormScreen: React.FC<UserTeamFormScreenProps> = ({
  formData,
  onFormChange,
  onNavigateToLeagueSelect,
  onNavigateToTeamSelect,
  onNavigateToPositionSelect,
  onSubmit,
  isSubmitting,
  isEditing = false,
}) => {
  const [sports, setSports] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingSports, setIsLoadingSports] = useState(true);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  const currentYear = new Date().getFullYear();

  // Helper to show error at the clicked field
  const showError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  // Load sports enum
  useEffect(() => {
    const loadSports = async () => {
      try {
        const sportsData = await sportsApi.getSports();
        // Convert sports dict to array of values
        setSports(Object.values(sportsData));
      } catch (err) {
        console.error('Failed to load sports:', err);
      } finally {
        setIsLoadingSports(false);
      }
    };

    loadSports();
  }, []);

  // Load countries enum
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await countriesApi.getCountries();
        // Convert countries dict to array of values
        setCountries(Object.values(countriesData));
      } catch (err) {
        console.error('Failed to load countries:', err);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  const handleLeagueClick = () => {
    // Validate sport and country before navigating
    if (!formData.sport) {
      showError('league', 'Please select a sport first');
      return;
    }
    if (!formData.country) {
      showError('league', 'Please select a country first');
      return;
    }

    onNavigateToLeagueSelect();
  };

  const handleTeamClick = () => {
    // Validate sport, country, and league before navigating
    if (!formData.sport) {
      showError('team', 'Please select a sport first');
      return;
    }
    if (!formData.country) {
      showError('team', 'Please select a country first');
      return;
    }
    if (!formData.league) {
      showError('team', 'Please select a league first');
      return;
    }

    onNavigateToTeamSelect();
  };

  const handlePositionClick = () => {
    // Only validate sport
    if (!formData.sport) {
      showError('position', 'Please select a sport first');
      return;
    }

    onNavigateToPositionSelect();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate all required fields
    const newErrors: Record<string, string> = {};
    if (!formData.sport) newErrors.sport = 'Sport is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.league) newErrors.league = 'League is required';
    if (!formData.team) newErrors.team = 'Team is required';
    if (!formData.yearJoined) newErrors.yearJoined = 'Year joined is required';
    if (!formData.isCurrentTeam && !formData.yearLeft) {
      newErrors.yearLeft =
        'Year left is required (or check "currently playing")';
    }

    // Validate year range
    if (formData.yearJoined && typeof formData.yearJoined === 'number') {
      if (formData.yearJoined < 1900 || formData.yearJoined > currentYear) {
        newErrors.yearJoined = `Year must be between 1900 and ${currentYear}`;
      }
    }

    if (formData.yearLeft && typeof formData.yearLeft === 'number') {
      if (formData.yearLeft < 1900 || formData.yearLeft > currentYear + 1) {
        newErrors.yearLeft = `Year must be between 1900 and ${currentYear + 1}`;
      }
      if (formData.yearJoined && formData.yearLeft < formData.yearJoined) {
        newErrors.yearLeft = 'Year left cannot be before year joined';
      }
    }

    // Validate jersey number
    if (
      formData.jerseyNumber !== '' &&
      typeof formData.jerseyNumber === 'number'
    ) {
      if (formData.jerseyNumber < 0 || formData.jerseyNumber > 9999) {
        newErrors.jerseyNumber = 'Jersey number must be between 0 and 9999';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Sport */}
      <div>
        <label className="block text-sm font-medium text-text-col mb-2">
          Sport *
        </label>
        {isLoadingSports ? (
          <div className="h-12 bg-bg-col rounded-lg animate-pulse" />
        ) : (
          <select
            value={formData.sport}
            onChange={(e) => onFormChange({ sport: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-bg-col border border-text-col/30 text-text-col focus:outline-none focus:ring-2 focus:ring-accent-col capitalize"
          >
            <option value="">Select a sport</option>
            {sports.map((sport) => (
              <option key={sport} value={sport} className="capitalize">
                {sport}
              </option>
            ))}
          </select>
        )}
        {errors.sport && (
          <p className="text-red-500 text-xs mt-1">{errors.sport}</p>
        )}
      </div>

      {/* Country */}
      <div>
        <SearchableDropdown
          label="Country"
          value={formData.country}
          options={countries}
          onChange={(country) => onFormChange({ country })}
          placeholder="Select a country"
          error={errors.country}
          required
          isLoading={isLoadingCountries}
        />
      </div>

      {/* League */}
      <div>
        <NavigationInput
          label="League"
          value={formData.league?.name}
          placeholder="Click to select league"
          onClick={handleLeagueClick}
          error={errors.league}
          required
        />
      </div>

      {/* Team */}
      <div>
        <NavigationInput
          label="Team"
          value={formData.team?.name}
          placeholder="Click to select team"
          onClick={handleTeamClick}
          error={errors.team}
          required
        />
      </div>

      {/* Currently Playing Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isCurrentTeam"
          checked={formData.isCurrentTeam}
          onChange={(e) => {
            onFormChange({
              isCurrentTeam: e.target.checked,
              yearLeft: e.target.checked ? '' : formData.yearLeft,
            });
          }}
          className="w-4 h-4 rounded border-text-col/30 bg-bg-col text-accent-col focus:ring-2 focus:ring-accent-col cursor-pointer"
        />
        <label
          htmlFor="isCurrentTeam"
          className="text-sm text-text-col cursor-pointer"
        >
          I am currently playing on this team
        </label>
      </div>

      {/* Year Joined */}
      <Input
        label="Year Joined *"
        type="number"
        value={formData.yearJoined}
        onChange={(e) =>
          onFormChange({
            yearJoined: e.target.value ? parseInt(e.target.value) : '',
          })
        }
        placeholder={`e.g., ${currentYear - 5}`}
        min={1900}
        max={currentYear}
        error={errors.yearJoined}
      />

      {/* Year Left (Conditional) */}
      {!formData.isCurrentTeam && (
        <Input
          label="Year Left *"
          type="number"
          value={formData.yearLeft}
          onChange={(e) =>
            onFormChange({
              yearLeft: e.target.value ? parseInt(e.target.value) : '',
            })
          }
          placeholder={`e.g., ${currentYear}`}
          min={1900}
          max={currentYear + 1}
          error={errors.yearLeft}
        />
      )}

      {/* Position (Optional) */}
      <div>
        <NavigationInput
          label="Position"
          value={formData.position?.name}
          placeholder="Click to select position (optional)"
          onClick={handlePositionClick}
          error={errors.position}
        />
      </div>

      {/* Jersey Number (Optional) */}
      <Input
        label="Jersey Number"
        type="number"
        value={formData.jerseyNumber}
        onChange={(e) =>
          onFormChange({
            jerseyNumber: e.target.value ? parseInt(e.target.value) : '',
          })
        }
        placeholder="e.g., 23"
        min={0}
        max={9999}
        error={errors.jerseyNumber}
      />

      {/* Add/Update Team Button */}
      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="w-full"
      >
        {isEditing ? 'Save Changes' : 'Add Team'}
      </Button>
    </form>
  );
};

export default UserTeamFormScreen;
