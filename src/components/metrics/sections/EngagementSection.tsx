import { EngagementMetrics } from '@/api/metrics';
import { formatPct, formatSecondsToHuman } from '@/lib/formatUtils';
import MetricCard from '../MetricCard';
import SectionHeader from '../SectionHeader';

interface EngagementSectionProps {
  data: EngagementMetrics;
}

export default function EngagementSection({ data }: EngagementSectionProps) {
  return (
    <>
      <SectionHeader title={`Engagement (Last ${data.days} days)`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Avg Session Duration"
          value={formatSecondsToHuman(data.avgSessionSeconds)}
          subValue={`Median: ${formatSecondsToHuman(data.medianSessionSeconds)}`}
        />
        <MetricCard
          label="Avg Screens/Session"
          value={data.avgScreensPerSession.toFixed(1)}
        />
        <MetricCard
          label="Avg Actions/Session"
          value={data.avgActionsPerSession.toFixed(1)}
        />
        <MetricCard
          label="Video Completion"
          value={formatPct(data.avgVideoCompletionRate * 100)}
          subValue={`Median: ${formatPct(data.medianVideoCompletionRate * 100)}`}
        />
        <MetricCard
          label="Feed Conversion"
          value={formatPct(data.feedConversionRate)}
          subValue="Sessions with actions"
        />
        <MetricCard
          label="Matchup Vote Rate"
          value={formatPct(data.matchupVoteRate)}
          subValue="Views that result in votes"
        />
      </div>
    </>
  );
}
