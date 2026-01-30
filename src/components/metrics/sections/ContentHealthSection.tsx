import { ContentMetrics } from '@/api/metrics';
import { formatPct } from '@/lib/formatUtils';
import MetricCard from '../MetricCard';
import SectionHeader from '../SectionHeader';

interface ContentHealthSectionProps {
  data: ContentMetrics;
}

export default function ContentHealthSection({ data }: ContentHealthSectionProps) {
  return (
    <>
      <SectionHeader title={`Content Health (Last ${data.days} days)`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Highlights" value={data.totalHighlights} />
        <MetricCard label="Total Lifestyle Posts" value={data.totalLifestylePosts} />
        <MetricCard label="Unique Creators" value={data.totalCreators} />
        <MetricCard
          label="Creators/Users Ratio"
          value={formatPct(data.creatorsToConsumersRatio)}
        />
      </div>
    </>
  );
}
