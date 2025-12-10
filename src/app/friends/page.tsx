'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import FriendsPage from '@/components/friends/FriendsPage';

const Page = () => {
  return (
    <AuthenticatedLayout>
      <FriendsPage />
    </AuthenticatedLayout>
  );
};

export default Page;
