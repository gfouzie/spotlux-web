/**
 * General formatting utilities
 */

/**
 * Format a number as a percentage with 1 decimal place
 * @param value - Number to format (e.g., 45.678)
 * @returns Formatted percentage string (e.g., "45.7%")
 */
export const formatPct = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Format seconds to human-readable duration
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "45s", "3m 15s", "2h 30m")
 */
export const formatSecondsToHuman = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
};

/**
 * Format snake_case string to Title Case
 * @param str - Snake case string (e.g., "action_type_name")
 * @returns Title case string (e.g., "Action Type Name")
 */
export const formatSnakeToTitle = (str: string): string => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
