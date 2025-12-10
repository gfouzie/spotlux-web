'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PromptsPage from '@/components/internal-tools/PromptsPage';

const Page = () => {
  return (
    <AuthenticatedLayout>
      <PromptsPage />
    </AuthenticatedLayout>
  );
};

export default Page;
