'use client';

import React, { useState } from 'react';
import { Team, League } from '@/types/team';
import { teamsApi } from '@/api/teams';
import { uploadApi } from '@/api/upload';
import { compressImage } from '@/lib/compression/imageCompression';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import TeamLogoUpload from './TeamLogoUpload';
import { TeamFormData } from './types';

interface TeamCreateScreenProps {
  sport: string;
  league: League;
  formData: TeamFormData;
  onFormChange: (data: Partial<TeamFormData>) => void;
  onCreate: (team: Team) => void;
}

const TeamCreateScreen: React.FC<TeamCreateScreenProps> = ({
  sport,
  league,
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
      newErrors.name = 'Team name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the team
      const createdTeam = await teamsApi.createTeam({
        name: formData.name.trim(),
        sport,
        leagueId: league.id,
        level: formData.level.trim() || null,
      });

      // Step 2: Upload logo if provided
      if (formData.logoFile) {
        try {
          // Compress the image before uploading
          const { compressedFile } = await compressImage(formData.logoFile, {
            maxSizeMB: 1,
            maxWidthOrHeight: 800,
            quality: 0.85,
          });

          const uploadResult = await uploadApi.uploadTeamPicture(
            createdTeam.id,
            compressedFile
          );
          createdTeam.profileImageUrl = uploadResult.profileImageUrl;
        } catch (uploadErr) {
          console.error('Failed to upload team logo:', uploadErr);
          // Continue anyway - team is created, just without logo
        }
      }

      onCreate(createdTeam);
    } catch (err) {
      setErrors({ submit: 'Failed to create team. Please try again.' });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Team Logo Upload */}
      <TeamLogoUpload
        onLogoChange={(file) => onFormChange({ logoFile: file })}
        error={errors.logo}
      />

      {/* Team Full Name */}
      <Input
        label="Team Full Name *"
        value={formData.name}
        onChange={(e) => onFormChange({ name: e.target.value })}
        placeholder="e.g., Los Angeles Lakers"
        error={errors.name}
        maxLength={100}
      />

      {/* Team Level/Tier/Division */}
      <Input
        label="Team Level/Tier/Division (optional)"
        value={formData.level}
        onChange={(e) => onFormChange({ level: e.target.value })}
        placeholder="e.g., Professional, College, Division 1"
        maxLength={100}
      />

      {/* League (Disabled) */}
      <Input
        label="League *"
        value={league.name}
        disabled
        className="opacity-60 cursor-not-allowed"
      />

      {/* Sport (Disabled) */}
      <Input
        label="Sport *"
        value={sport}
        disabled
        className="opacity-60 cursor-not-allowed"
      />

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-sm text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Add Team Button */}
      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="w-full"
      >
        Add Team
      </Button>
    </form>
  );
};

export default TeamCreateScreen;
