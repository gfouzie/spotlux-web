'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { EditPencil } from 'iconoir-react';
import { UserProfile } from '@/api/profile';
import { User } from '@/api/user';
import { uploadApi } from '@/api/upload';
import { compressImage } from '@/lib/compression/imageCompression';
import FriendsListModal from '@/components/friends/FriendsListModal';
import EditProfileModal from '@/components/profile/EditProfileModal';

interface ProfilePictureSectionProps {
  user: User | UserProfile;
  isOwnProfile?: boolean;
  onProfileUpdate?: () => Promise<void>;
}

/**
 * Get user initials for placeholder
 */
const getUserInitials = (
  firstName: string | null,
  lastName: string | null
): string => {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';

  if (first && last) {
    return (first[0] + last[0]).toUpperCase();
  } else if (first) {
    return first.substring(0, 2).toUpperCase();
  } else if (last) {
    return last.substring(0, 2).toUpperCase();
  }
  return '??';
};

/**
 * Format birthday for display (without timezone conversion)
 */
const formatBirthday = (birthday: string | null): string => {
  if (!birthday) return 'Not set';

  try {
    // Parse date components directly to avoid timezone issues
    const [year, month, day] = birthday.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Not set';
  }
};

/**
 * Format height in inches to feet and inches display
 */
const formatHeight = (heightInches: number | null): string => {
  if (!heightInches) return 'Not set';

  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;

  return `${feet}'${inches}"`;
};

/**
 * Format weight in lbs
 */
const formatWeight = (weightLbs: number | null): string => {
  if (!weightLbs) return 'Not set';
  return `${weightLbs} lbs`;
};

const formatHometown = (
  city: string | null,
  state: string | null,
  country: string | null
): string => {
  const parts = [city, state, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Not set';
};

/**
 * Format hometown for mobile (city, state only)
 */
const formatHometownMobile = (
  city: string | null,
  state: string | null
): string => {
  const parts = [city, state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Not set';
};

const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  user,
  isOwnProfile = false,
  onProfileUpdate,
}) => {
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = getUserInitials(
    user?.firstName || null,
    user?.lastName || null
  );
  const currentProfileImageUrl = user?.profileImageUrl;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // Compress the image
      const { compressedFile } = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        quality: 0.85,
      });

      // Upload the compressed image
      await uploadApi.uploadProfilePicture(compressedFile);

      // Notify parent to refresh profile data
      await onProfileUpdate?.();
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteProfilePicture = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to remove your profile picture?'
    );

    if (!confirmed) return;

    setIsUploading(true);

    try {
      await uploadApi.deleteProfilePicture();
      await onProfileUpdate?.();
    } catch (err) {
      console.error('Failed to delete profile picture:', err);
      alert('Failed to delete profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="bg-card-col rounded-lg p-6 relative">
        {/* Edit Icon */}
        {isOwnProfile && (
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="cursor-pointer absolute top-4 right-4 p-2 text-text-col opacity-70 hover:opacity-100 hover:bg-component-col/50 rounded-full transition-all"
          >
            <EditPencil className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Left: Profile Picture and Friends Link */}
            <div className="flex flex-col flex-shrink-0">
              <div className="relative w-16 h-16 lg:w-20 lg:h-20 mb-3">
                {/* Hidden file input */}
                {isOwnProfile && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-picture-upload"
                  />
                )}

                {currentProfileImageUrl ? (
                  <>
                    {isOwnProfile ? (
                      <label
                        htmlFor="profile-picture-upload"
                        className="cursor-pointer block w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <Image
                          src={currentProfileImageUrl}
                          alt="Profile"
                          fill
                          sizes="(max-width: 1024px) 64px, 80px"
                          className="object-cover border-2 border-accent-col rounded-full"
                        />
                      </label>
                    ) : (
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden">
                        <Image
                          src={currentProfileImageUrl}
                          alt="Profile"
                          fill
                          sizes="(max-width: 1024px) 64px, 80px"
                          className="object-cover border-2 border-accent-col rounded-full"
                        />
                      </div>
                    )}
                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={handleDeleteProfilePicture}
                        disabled={isUploading}
                        className="cursor-pointer absolute -top-0 -right-0 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
                        aria-label="Remove profile picture"
                      >
                        <span className="text-lg font-light leading-none">
                          −
                        </span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {isOwnProfile ? (
                      <label
                        htmlFor="profile-picture-upload"
                        className="cursor-pointer w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-accent-col/20 flex items-center justify-center hover:bg-accent-col/30 transition-colors border-2 border-accent-col/50"
                      >
                        <span className="text-xl lg:text-2xl font-semibold text-text-col">
                          {initials}
                        </span>
                      </label>
                    ) : (
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-accent-col/20 flex items-center justify-center border-2 border-accent-col/50">
                        <span className="text-xl lg:text-2xl font-semibold text-text-col">
                          {initials}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowFriendsModal(true)}
                className="cursor-pointer text-sm text-accent-col hover:text-accent-col/80 transition-colors font-medium text-left"
              >
                View Friends
              </button>
            </div>

            {/* Middle: First Name and Last Name stacked */}
            <div className="flex flex-col justify-center">
              <div className="text-lg md:text-xl font-semibold text-text-col">
                {user?.firstName}
              </div>
              <div className="text-xl md:text-3xl font-bold text-text-col">
                {user?.lastName}
              </div>
            </div>
          </div>

          {/* Right: Stats vertically aligned */}
          <div className="flex flex-col gap-1 text-right mt-8">
            {/* Birthday */}
            <div className="flex items-center justify-end">
              <span className="hidden md:flex text-sm text-text-col opacity-70 mr-1">
                Born:{' '}
              </span>
              <span className="text-sm text-text-col">
                {formatBirthday(user?.birthday || null)}
              </span>
            </div>

            {/* Height & Weight - Combined on mobile, separate on desktop */}
            <div className="md:hidden flex items-center justify-end">
              <span className="text-sm text-text-col">
                {formatHeight(user?.height || null)} •{' '}
                {formatWeight(user?.weight || null)}
              </span>
            </div>

            <div className="hidden md:flex items-center justify-end">
              <span className="text-sm text-text-col opacity-70 mr-1">
                Height:{' '}
              </span>
              <span className="text-sm text-text-col">
                {formatHeight(user?.height || null)}
              </span>
            </div>
            <div className="hidden md:flex items-center justify-end">
              <span className="text-sm text-text-col opacity-70 mr-1">
                Weight:{' '}
              </span>
              <span className="text-sm text-text-col">
                {formatWeight(user?.weight || null)}
              </span>
            </div>

            {/* Hometown - City/State on mobile, full on desktop */}
            <div className="md:hidden flex items-center justify-end">
              <span className="text-sm text-text-col">
                {formatHometownMobile(
                  user?.hometownCity || null,
                  user?.hometownState || null
                )}
              </span>
            </div>
            <div className="hidden md:flex items-center justify-end">
              <span className="text-sm text-text-col opacity-70 mr-1">
                Hometown:{' '}
              </span>
              <span className="text-sm text-text-col">
                {formatHometown(
                  user?.hometownCity || null,
                  user?.hometownState || null,
                  user?.hometownCountry || null
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Friends List Modal */}
      <FriendsListModal
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        userId={user?.id || 0}
        isOwnProfile={isOwnProfile}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSuccess={onProfileUpdate}
      />
    </>
  );
};

export default ProfilePictureSection;
