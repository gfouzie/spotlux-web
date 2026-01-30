'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import MetricsPage from '@/components/metrics/MetricsPage';

export default function Metrics() {
  return (
    <AuthenticatedLayout>
      <MetricsPage />
    </AuthenticatedLayout>
  );
}
