'use client';

import UserSettings from '@/components/settings/UserSettings';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const SettingsPage = () => {
  // Mock user data - in a real app, this would come from your auth context or API
  const mockUser = {
    id: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    username: 'demo_user',
    email: 'demo@example.com',
    first_name: 'Demo',
    last_name: 'User',
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-bg-col text-text-col p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1>Settings</h1>
          <UserSettings user={mockUser} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default SettingsPage;
