'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { MessagingProvider } from '@/contexts/MessagingContext';
import MessagesPage from '@/components/messages/MessagesPage';

const Page = () => {
  return (
    <AuthenticatedLayout>
      <MessagingProvider>
        <MessagesPage />
      </MessagingProvider>
    </AuthenticatedLayout>
  );
};

export default Page;
