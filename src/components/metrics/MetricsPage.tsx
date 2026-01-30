'use client';

import { useEffect, useState } from 'react';
import { RefreshDouble } from 'iconoir-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  getOverviewMetrics,
  getEngagementMetrics,
  getRetentionMetrics,
  getFeatureMetrics,
  getContentMetrics,
  getDauTrend,
  OverviewMetrics,
  EngagementMetrics,
  RetentionMetrics,
  FeatureMetrics,
  ContentMetrics,
  DailyActiveUsersEntry,
} from '@/api/metrics';
import Button from '@/components/common/Button';
import LoadingState from '@/components/common/LoadingState';
import Alert from '@/components/common/Alert';
import OverviewSection from './sections/OverviewSection';
import EngagementSection from './sections/EngagementSection';
import RetentionSection from './sections/RetentionSection';
import FeatureUsageSection from './sections/FeatureUsageSection';
import ContentHealthSection from './sections/ContentHealthSection';
import DAUTrendSection from './sections/DAUTrendSection';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MetricsPage() {
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [retention, setRetention] = useState<RetentionMetrics | null>(null);
  const [features, setFeatures] = useState<FeatureMetrics | null>(null);
  const [content, setContent] = useState<ContentMetrics | null>(null);
  const [dauTrend, setDauTrend] = useState<DailyActiveUsersEntry[] | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMetrics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        overviewData,
        engagementData,
        retentionData,
        featuresData,
        contentData,
        dauData,
      ] = await Promise.all([
        getOverviewMetrics(),
        getEngagementMetrics(7),
        getRetentionMetrics(4),
        getFeatureMetrics(30),
        getContentMetrics(7),
        getDauTrend(30),
      ]);

      setOverview(overviewData);
      setEngagement(engagementData);
      setRetention(retentionData);
      setFeatures(featuresData);
      setContent(contentData);
      setDauTrend(dauData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setError('Failed to load metrics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (isLoading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading metrics..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Metrics Dashboard</h1>
          <p className="text-text-col/60 text-sm">
            Internal analytics for founders
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-text-col/50">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={loadMetrics}
            disabled={isLoading}
            leftIcon={<RefreshDouble className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {overview && <OverviewSection data={overview} />}
      {engagement && <EngagementSection data={engagement} />}
      {retention && <RetentionSection data={retention} />}
      {features && <FeatureUsageSection data={features} />}
      {content && <ContentHealthSection data={content} />}
      {dauTrend && <DAUTrendSection data={dauTrend} />}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-bg-col text-center text-xs text-text-col/50">
        Data refreshes on page load. Click Refresh for latest data.
      </div>
    </div>
  );
}
