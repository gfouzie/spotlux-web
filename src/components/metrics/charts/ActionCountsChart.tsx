'use client';

import { Bar } from 'react-chartjs-2';
import { CHART_COLORS } from '@/constants/chartColors';
import { formatSnakeToTitle } from '@/lib/formatUtils';

interface ActionCountData {
  actionType: string;
  totalCount: number;
  uniqueUsers: number;
}

interface ActionCountsChartProps {
  data: ActionCountData[];
}

export default function ActionCountsChart({ data }: ActionCountsChartProps) {
  const chartData = {
    labels: data.map((d) => formatSnakeToTitle(d.actionType)),
    datasets: [
      {
        label: 'Total Count',
        data: data.map((d) => d.totalCount),
        backgroundColor: CHART_COLORS.primary,
        borderRadius: 4,
      },
      {
        label: 'Unique Users',
        data: data.map((d) => d.uniqueUsers),
        backgroundColor: CHART_COLORS.secondary,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: CHART_COLORS.text },
      },
    },
    scales: {
      x: {
        ticks: { color: CHART_COLORS.text },
        grid: { color: CHART_COLORS.grid },
        beginAtZero: true,
      },
      y: {
        ticks: { color: CHART_COLORS.text },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}
