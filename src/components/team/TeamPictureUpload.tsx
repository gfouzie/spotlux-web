'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { uploadApi } from '@/api/upload';
import { validateImageFile } from '@/lib/compression';

interface TeamPictureUploadProps {
  teamId: number;
  teamName: string;
  currentImageUrl: string | null;
  onImageUpdate: (newUrl: string | null) => void;
  isEditMode?: boolean;
}

/**
 * Get initials from team name for placeholder
 */
const getTeamInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words?.length === 1) {
    return words?.[0]?.substring(0, 2).toUpperCase();
  }
  return (words?.[0]?.[0] + words?.[words?.length - 1]?.[0]).toUpperCase();
};

/**
 * TeamPictureUpload component for uploading and managing team profile pictures
 * Example usage for team image management
 */
const TeamPictureUpload: React.FC<TeamPictureUploadProps> = ({
  teamId,
  teamName,
  currentImageUrl,
  onImageUpdate,
  isEditMode = false,
}) => {
  const initials = getTeamInitials(teamName);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file using validation function
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const data = await uploadApi.uploadTeamPicture(teamId, file);
      onImageUpdate(data.profileImageUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to upload team picture'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this team picture?')) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadApi.deleteTeamPicture(teamId);
      onImageUpdate(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete team picture'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-component-col rounded-lg p-6">
      <h2 className="mb-4">Team Picture</h2>

      <div className="flex flex-col items-center space-y-4">
        {/* Team Picture Display */}
        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-bg-col">
          {currentImageUrl ? (
            <Image
              src={currentImageUrl}
              alt="Team picture"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent-col/20">
              <span className="text-2xl lg:text-4xl font-semibold text-text-col">
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Upload/Delete Controls (only in edit mode) */}
        {isEditMode && (
          <div className="flex flex-col items-center space-y-2 w-full max-w-xs">
            <label
              htmlFor="team-picture-upload"
              className={`w-full px-4 py-2 bg-accent-col text-text-col rounded-md text-center cursor-pointer hover:opacity-80 transition-opacity ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload New Picture'}
            </label>
            <input
              id="team-picture-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />

            {currentImageUrl && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={uploading}
                className="w-full px-4 py-2 bg-bg-col/50 text-text-col rounded-md hover:bg-bg-col transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Picture
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-xs p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPictureUpload;
