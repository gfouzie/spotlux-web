'use client';

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import ProfilePictureSection from '@/components/profile/ProfilePictureSection';
import ProfileSportSelector from '@/components/profile/ProfileSportSelector';
import { profileApi } from '@/api/profile';
import { useUser } from '@/contexts/UserContext';
import {
  ProfileSportProvider,
  useProfileSport,
} from '@/contexts/ProfileSportContext';
import HighlightProfileContent from '@/components/highlights/HighlightProfileContent';

function ProfileContent() {
  const { user } = useUser();
  const {
    userSports,
    selectedSport,
    isLoading: sportsLoading,
  } = useProfileSport();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const profileData = await profileApi.getProfile();
        setProfileImageUrl(profileData.profileImageUrl);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  const loading = profileLoading || sportsLoading;

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-bg-col py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-col">
              {user?.username || 'Profile'}
            </h1>
          </div>

          {/* Profile Sections */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <ProfilePictureSection
                profileImageUrl={profileImageUrl}
                firstName={user?.firstName || null}
                lastName={user?.lastName || null}
                userId={user?.id || 0}
                isOwnProfile={true}
              />

              {/* Sport Selector - Shared across all sections */}
              {userSports.length > 0 && <ProfileSportSelector />}

              {/* Highlights Section */}
              {user && selectedSport && (
                <div className="bg-card-col rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-text-col mb-6">
                    Highlights
                  </h2>
                  <HighlightProfileContent
                    sport={selectedSport}
                    isOwner={true}
                  />
                </div>
              )}

              {/*User Team Section*/}
              {user && (
                <div className="bg-card-col rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-text-col mb-6">
                    Teams
                  </h2>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

const ProfilePage: React.FC = () => {
  return (
    <ProfileSportProvider>
      <ProfileContent />
    </ProfileSportProvider>
  );
};

export default ProfilePage;
