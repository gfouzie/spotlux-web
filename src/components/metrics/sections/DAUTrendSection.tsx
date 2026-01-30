import { DailyActiveUsersEntry } from '@/api/metrics';
import DAUTrendChart from '../charts/DAUTrendChart';
import SectionHeader from '../SectionHeader';

interface DAUTrendSectionProps {
  data: DailyActiveUsersEntry[];
}

export default function DAUTrendSection({ data }: DAUTrendSectionProps) {
  if (data.length === 0) {
    return (
      <p className="text-text-col/60 text-sm mt-8">
        No DAU data available yet. Data will appear once users start creating sessions.
      </p>
    );
  }

  return (
    <>
      <SectionHeader title="Daily Active Users (Last 30 days)" />
      <div className="bg-bg-col/30 rounded-lg p-4 border border-bg-col">
        <DAUTrendChart data={data} />
      </div>
    </>
  );
}
