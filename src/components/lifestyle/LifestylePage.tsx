'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'iconoir-react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import CalendarGrid from '@/components/lifestyle/CalendarGrid';
import CalendarDayModal from '@/components/lifestyle/CalendarDayModal';
import SleepInsights from '@/components/lifestyle/SleepInsights';
import { useUser } from '@/contexts/UserContext';
import type { CalendarDate } from '@/api/lifestyle';
import LoadingState from '@/components/common/LoadingState';
import Alert from '@/components/common/Alert';

interface LifestylePageProps {
  userId: number;
}

const LifestylePage = ({ userId }: LifestylePageProps) => {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCalendarDate, setSelectedCalendarDate] =
    useState<CalendarDate | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Determine if viewing own lifestyle page
  const isOwnPage = currentUser?.id === userId;

  // Check if page is ready
  useEffect(() => {
    if (currentUser) {
      setIsLoading(false);
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-bg-col py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <LoadingState message="Loading..." />
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Lifestyle page is owner-only (fully private)
  if (!isOwnPage) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-bg-col py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Alert variant="error">
              You can only view your own lifestyle page.
            </Alert>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-bg-col py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg text-text-col hover:bg-bg-col/50 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft width={24} height={24} strokeWidth={2} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-text-col">
                Lifestyle
              </h1>
              <p className="text-sm text-text-col/60 mt-1">
                Your daily activity and insights
              </p>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-card-col rounded-lg p-6">
            <CalendarGrid
              userId={userId}
              onDayClick={(date) => {
                setSelectedCalendarDate(date);
                setIsCalendarModalOpen(true);
              }}
            />
          </div>

          {/* Sleep Insights */}
          <div className="mt-8">
            <SleepInsights />
          </div>

          {/* Calendar Day Modal */}
          <CalendarDayModal
            isOpen={isCalendarModalOpen}
            onClose={() => {
              setIsCalendarModalOpen(false);
              setSelectedCalendarDate(null);
            }}
            selectedDate={selectedCalendarDate}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default LifestylePage;
