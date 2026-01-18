'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import ProfilePictureSection from '@/components/profile/ProfilePictureSection';
import ProfileSportSelector from '@/components/profile/ProfileSportSelector';
import { profileApi, type UserProfile } from '@/api/profile';
import { userApi, type User, type UserReadLimited } from '@/api/user';
import { useUser } from '@/contexts/UserContext';
import {
  ProfileSportProvider,
  useProfileSport,
} from '@/contexts/ProfileSportContext';
import HighlightProfileContent from '@/components/profile/highlights';
import UserTeamsProfileContent from '@/components/profile/user-teams';
import { ArrowLeft } from 'iconoir-react';
import FriendButton from '@/components/friends/FriendButton';
import MessageButton from '@/components/friends/MessageButton';
import { friendshipsApi } from '@/api/friendships';

interface ProfilePageProps {
  username?: string; // If undefined, show own profile; if provided, show that user's profile
}

function ProfileContent({ username }: ProfilePageProps) {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const {
    userSports,
    selectedSport,
    isLoading: sportsLoading,
  } = useProfileSport();
  const [profileUser, setProfileUser] = useState<User | UserProfile | UserReadLimited | null>(
    null
  );
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState(false);

  // Determine if viewing own profile
  const isOwnProfile = !username;
  const isOwner =
    isOwnProfile ||
    currentUser?.username === username ||
    currentUser?.username === profileUser?.username;

  // Check if profile is limited (private and not a friend)
  const isLimitedProfile = (user: User | UserProfile | UserReadLimited | null): user is UserReadLimited => {
    if (!user) return false;
    // UserReadLimited only has id, username, firstName, lastName, profileImageUrl, visibility
    // Full User/UserProfile has accountId or email
    return !('accountId' in user) && !('email' in user) && user.visibility === 'private';
  };

  const loadProfileData = useCallback(async () => {
    if (isOwnProfile && !currentUser) {
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      setError(null);

      if (isOwnProfile) {
        // Fetch own profile
        const data = await profileApi.getProfile();
        setProfileUser(data);
      } else {
        // Fetch other user's profile by username
        const data = await userApi.getUserByUsername(username!);
        setProfileUser(data);

        // Check friendship status for other users
        try {
          const status = await friendshipsApi.getFriendshipStatus(data.id);
          setIsFriend(status.status === 'accepted');
        } catch (err) {
          console.error('Failed to load friendship status:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(isOwnProfile ? 'Failed to load profile' : 'User not found');
    } finally {
      setProfileLoading(false);
    }
  }, [username, isOwnProfile, currentUser]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const loading = profileLoading || sportsLoading;

  // Show 404 error if user not found (public profiles only)
  if (!loading && error && !isOwnProfile) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-bg-col py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center h-64">
              <h1 className="mb-4">
                User Not Found
              </h1>
              <p className="text-text-col/60 mb-6">
                The user &quot;{username}&quot; does not exist.
              </p>
              <button
                onClick={() => router.push('/search')}
                className="px-4 py-2 bg-accent-col text-white rounded-md hover:bg-accent-col/90 transition-colors"
              >
                Search for Users
              </button>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-bg-col py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back button for public profiles only */}
              {!isOwnProfile && (
                <button
                  onClick={() => router.back()}
                  className="cursor-pointer p-2 rounded-lg text-text-col hover:bg-bg-col/50 transition-colors"
                  title="Go back"
                >
                  <ArrowLeft width={24} height={24} />
                </button>
              )}
              <h1>
                {profileUser?.username || 'Profile'}
              </h1>
            </div>

            {/* Friend and Message buttons for other users */}
            {!isOwner && profileUser && (
              <div className="flex items-center gap-3">
                <MessageButton userId={profileUser.id} isFriend={isFriend} />
                <FriendButton
                  userId={profileUser.id}
                  onStatusChange={() => {
                    // Reload to check friendship status
                    loadProfileData();
                  }}
                />
              </div>
            )}
          </div>

          {/* Profile Sections */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : profileUser ? (
            <div className="space-y-6">
              <ProfilePictureSection
                user={profileUser}
                isOwnProfile={isOwner}
                onProfileUpdate={loadProfileData}
              />

              {/* Limited Profile View */}
              {isLimitedProfile(profileUser) ? (
                <div className="bg-bg-col/50 backdrop-blur-sm rounded-xl border border-text-col/20 p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-accent-col/10 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-accent-col"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-medium text-text-col">
                      This Profile is Private
                    </h3>
                    <p className="text-sm text-text-col/60 max-w-md">
                      {profileUser.firstName} {profileUser.lastName} has set their profile to private.
                      Connect with them to see their highlights, teams, and other profile information.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Sport Selector - Shared across all sections */}
                  {userSports.length > 0 && <ProfileSportSelector />}

                  {/* Highlights Section */}
                  {selectedSport && (
                    <HighlightProfileContent
                      sport={selectedSport}
                      isOwner={isOwner}
                      userId={profileUser.id}
                    />
                  )}

                  {/* User Team Section */}
                  <div className="bg-card-col rounded-lg p-6">
                    <UserTeamsProfileContent
                      isOwner={isOwner}
                      userId={profileUser.id}
                    />
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  username,
}) => {
  return (
    <ProfileSportProvider username={username}>
      <ProfileContent username={username} />
    </ProfileSportProvider>
  );
};

export default ProfilePage;
