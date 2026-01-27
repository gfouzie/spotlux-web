"use client";

import { useState, useEffect } from "react";
import { NavArrowLeft, NavArrowRight } from "iconoir-react";
import { lifestyleApi, type CalendarDate } from "@/api/lifestyle";
import LoadingState from "@/components/common/LoadingState";
import Alert from "@/components/common/Alert";

interface CalendarGridProps {
  userId: number;
  onDayClick: (date: CalendarDate) => void;
}

const CalendarGrid = ({ userId, onDayClick }: CalendarGridProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch calendar data for current month
  useEffect(() => {
    const fetchCalendarData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Calculate start and end dates for current month
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Format dates as YYYY-MM-DD
        const startDate = firstDay.toISOString().split("T")[0];
        const endDate = lastDay.toISOString().split("T")[0];

        const timezoneOffset = new Date().getTimezoneOffset();

        const data = await lifestyleApi.getCalendar(
          userId,
          startDate,
          endDate,
          timezoneOffset
        );

        setCalendarData(data);
      } catch (err) {
        console.error("Failed to fetch calendar data:", err);
        setError("Failed to load calendar");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [userId, currentMonth]);

  // Navigate to previous month
  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Get color intensity based on post count
  const getColorIntensity = (postCount: number): string => {
    if (postCount === 0) return "bg-bg-col/20"; // Empty day
    if (postCount <= 2) return "bg-accent-col/30"; // Light
    if (postCount <= 4) return "bg-accent-col/60"; // Medium
    return "bg-accent-col/90"; // Dark
  };

  // Parse date string without timezone conversion
  const parseDateString = (dateStr: string): { year: number; month: number; day: number } => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return { year, month: month - 1, day }; // month is 0-indexed
  };

  // Build calendar grid with empty cells for days before month starts
  const buildCalendarGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week for first day (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();

    // Create map of dates to calendar data
    const dataMap = new Map<string, CalendarDate>();
    calendarData.forEach((day) => {
      dataMap.set(day.dayDate, day);
    });

    // Build grid cells
    const cells: (CalendarDate | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(null);
    }

    // Add cells for each day of month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      // Format date as YYYY-MM-DD without timezone conversion
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = dataMap.get(dateStr);

      cells.push(
        dayData || {
          dayDate: dateStr,
          postCount: 0,
          isPrivateToUser: false,
          aggregateId: null,
        }
      );
    }

    return cells;
  };

  const cells = buildCalendarGrid();
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (isLoading) {
    return <LoadingState message="Loading calendar..." />;
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-bg-col/50 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <NavArrowLeft className="w-5 h-5 text-text-col" strokeWidth={2} />
        </button>

        <h3 className="text-lg font-medium text-text-col">{monthName}</h3>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-bg-col/50 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <NavArrowRight className="w-5 h-5 text-text-col" strokeWidth={2} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-text-col/60"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, index) => {
          if (!cell) {
            // Empty cell before month starts
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          // Parse day number without timezone conversion
          const { day: dayNumber } = parseDateString(cell.dayDate);
          const isClickable = cell.postCount > 0;

          return (
            <button
              key={cell.dayDate}
              onClick={() => isClickable && onDayClick(cell)}
              disabled={!isClickable}
              className={`
                aspect-square rounded-lg flex items-center justify-center
                text-sm font-medium transition-all
                ${getColorIntensity(cell.postCount)}
                ${
                  isClickable
                    ? "cursor-pointer hover:scale-105 hover:ring-2 hover:ring-accent-col"
                    : "cursor-default"
                }
                ${cell.postCount > 0 ? "text-text-col" : "text-text-col/40"}
              `}
              aria-label={
                isClickable
                  ? `${dayNumber} - ${cell.postCount} post${cell.postCount > 1 ? "s" : ""}`
                  : `${dayNumber} - No posts`
              }
            >
              {dayNumber}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-text-col/60">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-bg-col/20" />
          <div className="w-4 h-4 rounded bg-accent-col/30" />
          <div className="w-4 h-4 rounded bg-accent-col/60" />
          <div className="w-4 h-4 rounded bg-accent-col/90" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default CalendarGrid;
