interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
}

export default function MetricCard({ label, value, subValue }: MetricCardProps) {
  return (
    <div className="bg-bg-col/30 rounded-lg p-4 border border-bg-col">
      <p className="text-sm text-text-col/60 mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {subValue && <p className="text-xs text-text-col/50 mt-1">{subValue}</p>}
    </div>
  );
}
