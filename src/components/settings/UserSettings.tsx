'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';

interface UserSettingsProps {
  user?: {
    id: number;
    uuid: string;
    username: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

const UserSettings = ({ user }: UserSettingsProps) => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-col/70">Please log in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-col mb-4">
          Account Settings
        </h2>
        <p className="text-sm text-text-col/70">
          Manage your account preferences and information.
        </p>
      </div>

      {/* User Info Display */}
      <div className="bg-bg-col/50 backdrop-blur-sm rounded-xl border border-text-col/20 p-6">
        <h3 className="text-lg font-medium text-text-col mb-4">
          Profile Information
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-text-col/10">
            <span className="text-sm font-medium text-text-col">Username</span>
            <span className="text-sm text-text-col/70">
              {user?.username || 'demo_user'}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-text-col/10">
            <span className="text-sm font-medium text-text-col">Email</span>
            <span className="text-sm text-text-col/70">
              {user?.email || 'user@example.com'}
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
        <h3 className="text-lg font-medium text-text-col mb-4">Appearance</h3>

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
        <h3 className="text-lg font-medium text-text-col mb-4">
          Security & Privacy
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
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

      {/* API Integration Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-medium text-blue-500 mb-2">
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
