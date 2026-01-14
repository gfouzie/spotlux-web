/**
 * Date and time formatting utilities
 */

/**
 * Format a date string to "Month Day, Year" format
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "January 15, 2024")
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00'); // Ensure local timezone
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a date string to short locale format
 * @param dateStr - ISO date string
 * @returns Formatted date string (e.g., "1/15/2024")
 */
export const formatShortDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString();
};

/**
 * Format a time string to 12-hour format with AM/PM
 * @param timeStr - Time string in HH:MM:SS format
 * @returns Formatted time string (e.g., "3:45 PM") or null if invalid
 */
export const formatTime = (timeStr: string | undefined): string | null => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format seconds to M:SS format (for video duration)
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "3:45")
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format a date string to relative time
 * @param dateString - ISO date string
 * @returns Relative time string (e.g., "now", "5m", "3h", "2d")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
};
