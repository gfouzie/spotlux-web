'use client';

import { Line } from 'react-chartjs-2';
import { DailyActiveUsersEntry } from '@/api/metrics';
import { CHART_COLORS } from '@/constants/chartColors';

interface DAUTrendChartProps {
  data: DailyActiveUsersEntry[];
}

export default function DAUTrendChart({ data }: DAUTrendChartProps) {
  const chartData = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        label: 'Active Users',
        data: data.map((d) => d.activeUsers),
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primaryLight,
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Sessions',
        data: data.map((d) => d.totalSessions),
        borderColor: CHART_COLORS.secondary,
        backgroundColor: 'transparent',
        tension: 0.3,
      },
    ],
  };

  const options = {
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
      },
      y: {
        ticks: { color: CHART_COLORS.text },
        grid: { color: CHART_COLORS.grid },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}
