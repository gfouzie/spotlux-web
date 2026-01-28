import { config } from '@/lib/config';
import { getToken } from './client';

/**
 * Video engagement data (for highlights)
 */
export interface VideoEngagementData {
  highlightId: number;
  watchDurationMs: number;
  videoDurationMs: number;
}

/**
 * Lifestyle engagement data (for daily aggregates)
 */
export interface LifestyleEngagementData {
  aggregateId: number;
  dwellTimeMs: number;
  slidesViewed: number;
  totalSlides: number;
}

/**
 * Matchup engagement data
 */
export interface MatchupEngagementData {
  highlightAId: number;
  highlightBId: number;
  dwellTimeMs: number;
  watchedAMs: number;
  watchedBMs: number;
  voted: boolean;
}

/**
 * Fire-and-forget fetch helper
 */
const fireAndForget = (url: string, payload: Record<string, unknown>): void => {
  const token = getToken();
  if (!token) return; // Not authenticated, skip tracking

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    keepalive: true, // Survives page unload
  }).catch(() => {
    // Fire and forget - ignore errors
  });
};

/**
 * Track video engagement for highlights (fire-and-forget)
 *
 * Uses fetch with keepalive to ensure data is sent even when user navigates away.
 */
export const trackVideoEngagement = (data: VideoEngagementData): void => {
  const payload = {
    highlight_id: data.highlightId,
    watch_duration_ms: data.watchDurationMs,
    video_duration_ms: data.videoDurationMs,
  };

  fireAndForget(`${config.apiBaseUrl}/api/v1/engagement/video`, payload);
};

/**
 * Track lifestyle engagement (fire-and-forget)
 *
 * Uses fetch with keepalive to ensure data is sent even when user navigates away.
 */
export const trackLifestyleEngagement = (data: LifestyleEngagementData): void => {
  const payload = {
    aggregate_id: data.aggregateId,
    dwell_time_ms: data.dwellTimeMs,
    slides_viewed: data.slidesViewed,
    total_slides: data.totalSlides,
  };

  fireAndForget(`${config.apiBaseUrl}/api/v1/engagement/lifestyle`, payload);
};

/**
 * Track matchup engagement (fire-and-forget)
 *
 * Uses fetch with keepalive to ensure data is sent even when user navigates away.
 */
export const trackMatchupEngagement = (data: MatchupEngagementData): void => {
  const payload = {
    highlight_a_id: data.highlightAId,
    highlight_b_id: data.highlightBId,
    dwell_time_ms: data.dwellTimeMs,
    watched_a_ms: data.watchedAMs,
    watched_b_ms: data.watchedBMs,
    voted: data.voted,
  };

  fireAndForget(`${config.apiBaseUrl}/api/v1/engagement/matchup`, payload);
};

// Backwards compatibility alias
export const trackEngagement = trackVideoEngagement;

// Re-export types for backwards compatibility
export type EngagementData = VideoEngagementData;
