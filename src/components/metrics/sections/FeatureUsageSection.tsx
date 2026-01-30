import { FeatureMetrics } from '@/api/metrics';
import ScreenTimeChart from '../charts/ScreenTimeChart';
import ActionCountsChart from '../charts/ActionCountsChart';
import SectionHeader from '../SectionHeader';

interface FeatureUsageSectionProps {
  data: FeatureMetrics;
}

export default function FeatureUsageSection({ data }: FeatureUsageSectionProps) {
  return (
    <>
      <SectionHeader title={`Feature Usage (Last ${data.days} days)`} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-col/30 rounded-lg p-4 border border-bg-col">
          <h3 className="font-medium mb-3">Time per Screen</h3>
          {data.screenTime.length > 0 ? (
            <ScreenTimeChart data={data.screenTime.slice(0, 7)} />
          ) : (
            <p className="text-text-col/60 text-sm">No screen data yet</p>
          )}
        </div>

        <div className="bg-bg-col/30 rounded-lg p-4 border border-bg-col">
          <h3 className="font-medium mb-3">Actions by Type</h3>
          {data.actionCounts.length > 0 ? (
            <ActionCountsChart data={data.actionCounts} />
          ) : (
            <p className="text-text-col/60 text-sm">No action data yet</p>
          )}
        </div>
      </div>
    </>
  );
}
