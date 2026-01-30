import { OverviewMetrics } from '@/api/metrics';
import MetricCard from '../MetricCard';
import SectionHeader from '../SectionHeader';

interface OverviewSectionProps {
  data: OverviewMetrics;
}

export default function OverviewSection({ data }: OverviewSectionProps) {
  return (
    <>
      <SectionHeader title="Overview (Real-time)" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="Active Users Today" value={data.activeUsersToday} />
        <MetricCard label="Sessions Today" value={data.sessionsToday} />
        <MetricCard label="Sessions (7d)" value={data.sessionsThisWeek} />
        <MetricCard label="Total Highlights" value={data.totalHighlights} />
        <MetricCard label="Matchup Votes" value={data.totalMatchups} />
        <MetricCard label="Lifestyle Posts" value={data.totalLifestylePosts} />
      </div>
    </>
  );
}
