'use client';

import UserSettings from '@/components/settings/UserSettings';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const SettingsPage = () => {
  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-bg-col text-text-col p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1>Settings</h1>
          <UserSettings />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default SettingsPage;
