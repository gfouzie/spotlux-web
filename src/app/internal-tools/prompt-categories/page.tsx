'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PromptCategoriesPage from '@/components/internal-tools/PromptCategoriesPage';

const Page = () => {
  return (
    <AuthenticatedLayout>
      <PromptCategoriesPage />
    </AuthenticatedLayout>
  );
};

export default Page;
