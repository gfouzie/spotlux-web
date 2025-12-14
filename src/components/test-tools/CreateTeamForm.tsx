'use client';

import React, { useState, useRef } from 'react';
import { teamsApi, CreateTeamData } from '@/api/teams';
import { uploadApi } from '@/api/upload';
import { Team } from '@/types/team';
import { validateImageFile } from '@/lib/compression';

interface CreateTeamFormProps {
  onTeamCreated?: (team: Team) => void;
}

const CreateTeamForm: React.FC<CreateTeamFormProps> = ({ onTeamCreated }) => {
  const [formData, setFormData] = useState<CreateTeamData>({
    name: '',
    sport: 'basketball',
    level: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sports = [
    'basketball',
    'soccer',
    'football',
    'baseball',
    'hockey',
    'volleyball',
    'tennis',
    'golf',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || null,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file using validation function
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid image file');
        return;
      }

      setProfileImage(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setLoading(true);

      // Create the team
      const team = await teamsApi.createTeam(formData);

      // Upload profile picture if provided
      if (profileImage) {
        const uploadData = await uploadApi.uploadTeamPicture(
          team.id,
          profileImage
        );
        team.profileImageUrl = uploadData.profileImageUrl;
      }

      setSuccess(`Team "${team.name}" created successfully!`);
      setFormData({
        name: '',
        sport: 'basketball',
        level: '',
      });
      setProfileImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onTeamCreated) {
        onTeamCreated(team);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-component-col rounded-lg p-6">
      <h2 className="mb-6">Create New Team</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Team Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-col mb-1"
          >
            Team Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 bg-bg-col text-text-col border border-component-col rounded-md focus:outline-none focus:ring-2 focus:ring-accent-col"
            placeholder="e.g., Los Angeles Lakers"
          />
        </div>

        {/* Sport */}
        <div>
          <label
            htmlFor="sport"
            className="block text-sm font-medium text-text-col mb-1"
          >
            Sport *
          </label>
          <select
            id="sport"
            name="sport"
            value={formData.sport}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 bg-bg-col text-text-col border border-component-col rounded-md focus:outline-none focus:ring-2 focus:ring-accent-col capitalize"
          >
            {sports.map((sport) => (
              <option key={sport} value={sport} className="capitalize">
                {sport}
              </option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div>
          <label
            htmlFor="level"
            className="block text-sm font-medium text-text-col mb-1"
          >
            Level (optional)
          </label>
          <input
            type="text"
            id="level"
            name="level"
            value={formData.level || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-bg-col text-text-col border border-component-col rounded-md focus:outline-none focus:ring-2 focus:ring-accent-col"
            placeholder="e.g., Professional, College, High School"
          />
        </div>

        {/* Profile Picture Upload */}
        <div>
          <label
            htmlFor="profilePicture"
            className="block text-sm font-medium text-text-col mb-1"
          >
            Team Logo/Picture (optional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="profilePicture"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="w-full px-3 py-2 bg-bg-col text-text-col border border-component-col rounded-md focus:outline-none focus:ring-2 focus:ring-accent-col file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent-col file:text-text-col file:cursor-pointer hover:file:opacity-80"
          />
          {profileImage && (
            <p className="text-sm text-text-col/60 mt-1">
              Selected: {profileImage.name}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md">
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer px-4 py-3 bg-accent-col text-text-col font-medium rounded-md hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Team...' : 'Create Team'}
        </button>
      </form>

      {/* File Requirements */}
      <div className="mt-4 p-3 bg-bg-col/50 rounded-md">
        <p className="text-xs text-text-col opacity-70">
          <strong>Image requirements:</strong> JPEG, PNG, GIF, or WebP • Max
          10MB
        </p>
      </div>
    </div>
  );
};

export default CreateTeamForm;
