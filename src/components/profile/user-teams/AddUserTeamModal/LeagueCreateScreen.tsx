'use client';

import React, { useState } from 'react';
import { League } from '@/types/team';
import { leaguesApi } from '@/api/leagues';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { LeagueFormData } from './types';

interface LeagueCreateScreenProps {
  sport: string;
  country: string;
  formData: LeagueFormData;
  onFormChange: (data: Partial<LeagueFormData>) => void;
  onCreate: (league: League) => void;
}

const LeagueCreateScreen: React.FC<LeagueCreateScreenProps> = ({
  sport,
  country,
  formData,
  onFormChange,
  onCreate,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'League name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const createdLeague = await leaguesApi.createLeague({
        name: formData.name.trim(),
        sport,
        country,
        abbreviation: formData.abbreviation.trim() || null,
        state: formData.state.trim() || null,
      });

      onCreate(createdLeague);
    } catch (err) {
      setErrors({ submit: 'Failed to create league. Please try again.' });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* League Full Name */}
      <Input
        label="League Full Name *"
        value={formData.name}
        onChange={(e) => onFormChange({ name: e.target.value })}
        placeholder="e.g., National Basketball Association"
        error={errors.name}
        maxLength={100}
      />

      {/* League Abbreviation */}
      <Input
        label="League Abbreviation"
        value={formData.abbreviation}
        onChange={(e) => onFormChange({ abbreviation: e.target.value })}
        placeholder="e.g., NBA"
        maxLength={10}
      />

      {/* Province/State */}
      <Input
        label="Province/State"
        value={formData.state}
        onChange={(e) => onFormChange({ state: e.target.value })}
        placeholder="e.g., California"
        maxLength={100}
      />

      {/* Sport (Disabled) */}
      <Input
        label="Sport *"
        value={sport}
        disabled
        className="opacity-60 cursor-not-allowed"
      />

      {/* Country (Disabled) */}
      <Input
        label="Country *"
        value={country}
        disabled
        className="opacity-60 cursor-not-allowed"
      />

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-sm text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Add League Button */}
      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="w-full"
      >
        Add League
      </Button>
    </form>
  );
};

export default LeagueCreateScreen;
