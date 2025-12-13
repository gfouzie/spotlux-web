'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import MessagesPage from '@/components/messages/MessagesPage';

const Page = () => {
  return (
    <AuthenticatedLayout>
      <MessagesPage />
    </AuthenticatedLayout>
  );
};

export default Page;
