"use client";

import { useState, useEffect } from "react";
import { lifestyleApi, type WakeTimeInsight, type SleepTimeInsight, type SleepDurationInsight } from "@/api/lifestyle";
import { formatTime } from "@/lib/dateUtils";
import LoadingState from "@/components/common/LoadingState";
import Alert from "@/components/common/Alert";

const SleepInsights = () => {
  const [wakeInsight, setWakeInsight] = useState<WakeTimeInsight | null>(null);
  const [sleepInsight, setSleepInsight] = useState<SleepTimeInsight | null>(null);
  const [durationInsight, setDurationInsight] = useState<SleepDurationInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get browser timezone offset in minutes
        const timezoneOffset = new Date().getTimezoneOffset();

        const [wake, sleep, duration] = await Promise.all([
          lifestyleApi.getWakeTimeInsight(7, timezoneOffset),
          lifestyleApi.getSleepTimeInsight(7, timezoneOffset),
          lifestyleApi.getSleepDurationInsight(7, timezoneOffset),
        ]);

        setWakeInsight(wake);
        setSleepInsight(sleep);
        setDurationInsight(duration);
      } catch (err) {
        console.error("Failed to fetch sleep insights:", err);
        setError("Failed to load insights");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading insights..." />;
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  const formatDurationHours = (hours: number | null): string => {
    if (hours === null) return "N/A";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-card-col rounded-lg p-6">
      <h2 className="text-lg font-semibold text-text-col mb-4">Sleep Insights</h2>
      <p className="text-sm text-text-col/60 mb-6">Last 7 days average</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Wake Time */}
        <div className="bg-bg-col/30 rounded-lg p-4 border border-text-col/10">
          <div className="text-2xl mb-2">⏰</div>
          <div className="text-sm text-text-col/60 mb-1">Wake Time</div>
          <div className="text-xl font-semibold text-text-col">
            {wakeInsight?.avgWakeTime ? formatTime(wakeInsight.avgWakeTime) : "N/A"}
          </div>
          <div className="text-xs text-text-col/40 mt-2">
            {wakeInsight?.daysWithData || 0}/{wakeInsight?.daysAnalyzed || 0} days
          </div>
        </div>

        {/* Sleep Time */}
        <div className="bg-bg-col/30 rounded-lg p-4 border border-text-col/10">
          <div className="text-2xl mb-2">🌙</div>
          <div className="text-sm text-text-col/60 mb-1">Sleep Time</div>
          <div className="text-xl font-semibold text-text-col">
            {sleepInsight?.avgSleepTime ? formatTime(sleepInsight.avgSleepTime) : "N/A"}
          </div>
          <div className="text-xs text-text-col/40 mt-2">
            {sleepInsight?.daysWithData || 0}/{sleepInsight?.daysAnalyzed || 0} days
          </div>
        </div>

        {/* Sleep Duration */}
        <div className="bg-bg-col/30 rounded-lg p-4 border border-text-col/10">
          <div className="text-2xl mb-2">😴</div>
          <div className="text-sm text-text-col/60 mb-1">Sleep Duration</div>
          <div className="text-xl font-semibold text-text-col">
            {formatDurationHours(durationInsight?.avgDurationHours ?? null)}
          </div>
          <div className="text-xs text-text-col/40 mt-2">
            {durationInsight?.daysWithData || 0}/{durationInsight?.daysAnalyzed || 0} days
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepInsights;
