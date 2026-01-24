'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { lifestyleApi, type CalendarDate } from '@/api/lifestyle';

interface MiniCalendarProps {
  userId: number;
  isOwnProfile?: boolean;
}

const MiniCalendar = ({ userId, isOwnProfile = false }: MiniCalendarProps) => {
  const router = useRouter();
  const [calendarData, setCalendarData] = useState<CalendarDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setIsLoading(true);

      try {
        const timezoneOffset = new Date().getTimezoneOffset();

        // Don't send end_date - let backend calculate "today" with 3am cutoff
        // Backend will default to lifestyle day (current date with 3am cutoff)
        // Then we'll take the last 5 days from the response
        const data = await lifestyleApi.getCalendar(
          userId,
          undefined, // start_date - let backend default to 30 days ago
          undefined, // end_date - let backend calculate with 3am cutoff
          timezoneOffset
        );

        setCalendarData(data);
      } catch (err) {
        console.error('Failed to fetch mini calendar data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivity();
  }, [userId]);

  // Get color intensity based on post count
  const getColorIntensity = (postCount: number): string => {
    if (postCount === 0) return 'bg-text-col/20'; // Empty day - more visible
    if (postCount <= 2) return 'bg-accent-col/40'; // Light
    if (postCount <= 4) return 'bg-accent-col/70'; // Medium
    return 'bg-accent-col'; // Dark
  };

  const handleClick = () => {
    router.push(`/lifestyle/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="inline-flex gap-1 p-1.5 bg-bg-col/30 border border-text-col/10 rounded-md">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm bg-bg-col/20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Only show the last 5 days
  const displayData = calendarData.slice(-5);

  // Non-clickable version (viewing someone else's profile)
  if (!isOwnProfile) {
    return (
      <div className="inline-flex gap-1 p-1.5 bg-bg-col/30 border border-text-col/10 rounded-md">
        {displayData.map((day) => (
          <div
            key={day.dayDate}
            className={`w-3 h-3 rounded-sm ${getColorIntensity(day.postCount)}`}
            title={`${day.postCount} ${day.postCount === 1 ? 'post' : 'posts'}`}
          />
        ))}
      </div>
    );
  }

  // Clickable version (own profile)
  return (
    <button
      onClick={handleClick}
      className="inline-flex gap-1 p-1.5 bg-bg-col/30 border border-text-col/10 rounded-md group cursor-pointer hover:bg-bg-col/40 hover:border-text-col/20 transition-all"
      aria-label="View full activity calendar"
    >
      {displayData.map((day) => (
        <div
          key={day.dayDate}
          className={`
            w-3 h-3 rounded-sm transition-all
            ${getColorIntensity(day.postCount)}
            group-hover:scale-110
          `}
          title={`${day.postCount} ${day.postCount === 1 ? 'post' : 'posts'}`}
        />
      ))}
    </button>
  );
};

export default MiniCalendar;
