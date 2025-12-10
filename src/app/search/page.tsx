'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import SearchPage from '@/components/search/SearchPage';

const Page = () => {
  return (
    <AuthenticatedLayout>
      <SearchPage />
    </AuthenticatedLayout>
  );
};

export default Page;
