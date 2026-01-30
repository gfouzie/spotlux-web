import { RetentionMetrics } from '@/api/metrics';
import { formatPct } from '@/lib/formatUtils';
import SectionHeader from '../SectionHeader';

interface RetentionSectionProps {
  data: RetentionMetrics;
}

export default function RetentionSection({ data }: RetentionSectionProps) {
  if (data.cohorts.length === 0) {
    return null;
  }

  return (
    <>
      <SectionHeader title="Retention by Cohort" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bg-col">
              <th className="text-left py-2 px-3">Cohort Week</th>
              <th className="text-right py-2 px-3">Users</th>
              <th className="text-right py-2 px-3">D1</th>
              <th className="text-right py-2 px-3">D7</th>
              <th className="text-right py-2 px-3">D30</th>
            </tr>
          </thead>
          <tbody>
            {data.cohorts.map((cohort) => (
              <tr
                key={cohort.cohortWeek}
                className="border-b border-bg-col/50 hover:bg-bg-col/30"
              >
                <td className="py-2 px-3">{cohort.cohortWeek}</td>
                <td className="text-right py-2 px-3">{cohort.cohortSize}</td>
                <td className="text-right py-2 px-3">
                  <span className="text-text-col/60">{cohort.retainedD1}</span>{' '}
                  ({formatPct(cohort.d1Pct)})
                </td>
                <td className="text-right py-2 px-3">
                  <span className="text-text-col/60">{cohort.retainedD7}</span>{' '}
                  ({formatPct(cohort.d7Pct)})
                </td>
                <td className="text-right py-2 px-3">
                  <span className="text-text-col/60">{cohort.retainedD30}</span>{' '}
                  ({formatPct(cohort.d30Pct)})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
