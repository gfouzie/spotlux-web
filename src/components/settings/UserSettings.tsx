'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import LoadingState from '@/components/common/LoadingState';
import { feedApi } from '@/api/feed';
import { profileApi, UserVisibility } from '@/api/profile';

const UserSettings = () => {
  const { isAuthenticated } = useAuth();
  const { user, isLoading: isUserLoading } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<UserVisibility>('public');
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [visibilityMessage, setVisibilityMessage] = useState<string | null>(null);

  // Load current profile visibility
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) return;

      try {
        const profile = await profileApi.getProfile();
        setVisibility(profile.visibility || 'public');
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  const handleVisibilityChange = async (newVisibility: UserVisibility) => {
    setIsUpdatingVisibility(true);
    setVisibilityMessage(null);

    try {
      await profileApi.updateProfile({ visibility: newVisibility });
      setVisibility(newVisibility);
      setVisibilityMessage('Profile visibility updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setVisibilityMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update visibility:', error);
      setVisibilityMessage('Failed to update visibility. Please try again.');
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleResetFeedHistory = async () => {
    if (
      !confirm(
        'Are you sure you want to reset your feed history? This will clear all viewed highlights and voted matchups.'
      )
    ) {
      return;
    }

    setIsResetting(true);
    setResetMessage(null);

    try {
      await feedApi.resetFeedHistory();
      setResetMessage('Feed history reset successfully! Refresh the feed to see content again.');
    } catch (error) {
      console.error('Failed to reset feed history:', error);
      setResetMessage('Failed to reset feed history. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-col/70">Please log in to view settings.</p>
      </div>
    );
  }

  if (isUserLoading) {
    return <LoadingState message="Loading settings..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4">
          Account Settings
        </h2>
        <p className="text-sm text-text-col/70">
          Manage your account preferences and information.
        </p>
      </div>

      {/* User Info Display */}
      <div className="bg-bg-col/50 backdrop-blur-sm rounded-xl border border-text-col/20 p-6">
        <h3 className="font-medium mb-4">
          Profile Information
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-text-col/10">
            <span className="text-sm font-medium text-text-col">Username</span>
            <span className="text-sm text-text-col/70">
              {user?.username || 'Not set'}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-text-col/10">
            <span className="text-sm font-medium text-text-col">Email</span>
            <span className="text-sm text-text-col/70">
              {user?.email || 'Not set'}
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-text-col">Name</span>
            <span className="text-sm text-text-col/70">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : 'Not provided'}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-bg-col/50 backdrop-blur-sm rounded-xl border border-text-col/20 p-6">
        <h3 className="font-medium mb-4">Appearance</h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <div>
              <span className="text-sm font-medium text-text-col">Theme</span>
              <p className="text-xs text-text-col/60">
                Switch between light and dark mode
              </p>
            </div>
            <Button onClick={toggleTheme} variant="secondary" size="sm">
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Settings Sections */}
      <div className="bg-bg-col/50 backdrop-blur-sm rounded-xl border border-text-col/20 p-6">
        <h3 className="font-medium mb-4">
          Security & Privacy
        </h3>

        <div className="space-y-3">
          <div className="py-2 border-b border-text-col/10">
            <div className="mb-2">
              <span className="text-sm font-medium text-text-col">
                Profile Visibility
              </span>
              <p className="text-xs text-text-col/60">
                Control who can view your profile and friends list
              </p>
            </div>
            <Select
              label=""
              value={visibility}
              onChange={(e) => handleVisibilityChange(e.target.value as UserVisibility)}
              options={[
                { value: 'public', label: 'Public - Anyone can view your profile' },
                { value: 'private', label: 'Private - Only friends can view your profile' },
              ]}
              disabled={isUpdatingVisibility}
            />
            {visibilityMessage && (
              <div
                className={`mt-2 p-2 rounded text-xs ${
                  visibilityMessage.includes('successfully')
                    ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                    : 'bg-red-500/10 border border-red-500/20 text-red-500'
                }`}
              >
                {visibilityMessage}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center py-2 border-b border-text-col/10">
            <div>
              <span className="text-sm font-medium text-text-col">
                Password
              </span>
              <p className="text-xs text-text-col/60">
                Last changed 30 days ago
              </p>
            </div>
            <Button variant="secondary" size="sm" disabled>
              Change Password
            </Button>
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <span className="text-sm font-medium text-text-col">
                Two-Factor Auth
              </span>
              <p className="text-xs text-text-col/60">
                Add extra security to your account
              </p>
            </div>
            <Button variant="secondary" size="sm" disabled>
              Enable 2FA
            </Button>
          </div>
        </div>
      </div>

      {/* Developer Tools */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
        <h3 className="font-medium text-yellow-500 mb-4">
          Developer Tools
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <div>
              <span className="text-sm font-medium text-text-col">
                Reset Feed History
              </span>
              <p className="text-xs text-text-col/60">
                Clear all viewed highlights and voted matchups to re-test the
                feed
              </p>
            </div>
            <Button
              onClick={handleResetFeedHistory}
              variant="secondary"
              size="sm"
              disabled={isResetting}
            >
              {isResetting ? 'Resetting...' : 'Reset Feed'}
            </Button>
          </div>

          {resetMessage && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${
                resetMessage.includes('successfully')
                  ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                  : 'bg-red-500/10 border border-red-500/20 text-red-500'
              }`}
            >
              {resetMessage}
            </div>
          )}
        </div>
      </div>

      {/* API Integration Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-medium text-blue-500 mb-2">
          API Integration
        </h3>
        <p className="text-sm text-blue-500/80 mb-3">
          This username change feature demonstrates the full-stack integration:
        </p>
        <div className="text-xs text-blue-500/70 space-y-1">
          <p>• Frontend validation with real-time feedback</p>
          <p>• Secure API calls with JWT authentication</p>
          <p>• Backend validation and database updates</p>
          <p>• Error handling and user feedback</p>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
