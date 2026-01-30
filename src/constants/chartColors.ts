/**
 * Chart.js color palette for metrics and analytics
 */

export const CHART_COLORS = {
  primary: 'rgb(99, 102, 241)', // indigo-500
  primaryLight: 'rgba(99, 102, 241, 0.1)',
  secondary: 'rgb(168, 85, 247)', // purple-500
  tertiary: 'rgb(236, 72, 153)', // pink-500
  quaternary: 'rgb(34, 211, 238)', // cyan-400
  text: 'rgba(255, 255, 255, 0.7)',
  grid: 'rgba(255, 255, 255, 0.1)',
} as const;

/**
 * Extended color palette for multi-series charts
 */
export const CHART_COLORS_EXTENDED = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  'rgb(74, 222, 128)', // green-400
  'rgb(251, 191, 36)', // amber-400
  'rgb(248, 113, 113)', // red-400
] as const;
