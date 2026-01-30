'use client';

import { Bar } from 'react-chartjs-2';
import { CHART_COLORS, CHART_COLORS_EXTENDED } from '@/constants/chartColors';

interface ScreenTimeData {
  screenName: string;
  totalSeconds: number;
  pctOfTotal: number;
}

interface ScreenTimeChartProps {
  data: ScreenTimeData[];
}

export default function ScreenTimeChart({ data }: ScreenTimeChartProps) {
  const chartData = {
    labels: data.map((d) => d.screenName || 'unknown'),
    datasets: [
      {
        label: 'Time (seconds)',
        data: data.map((d) => d.totalSeconds),
        backgroundColor: [...CHART_COLORS_EXTENDED],
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
