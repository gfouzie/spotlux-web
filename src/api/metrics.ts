/**
 * API client for internal metrics dashboard endpoints.
 */

import { config } from '@/lib/config';
import { authRequest } from './client';

// =============================================================================
// Types
// =============================================================================

export interface OverviewMetrics {
  activeUsersToday: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  totalHighlights: number;
  totalMatchups: number;
  totalLifestylePosts: number;
}

export interface EngagementMetrics {
  days: number;
  avgSessionSeconds: number;
  medianSessionSeconds: number;
  avgScreensPerSession: number;
  avgActionsPerSession: number;
  avgVideoCompletionRate: number;
  medianVideoCompletionRate: number;
  feedConversionRate: number;
  matchupVoteRate: number;
}

export interface RetentionCohort {
  cohortWeek: string;
  cohortSize: number;
  retainedD1: number;
  retainedD7: number;
  retainedD30: number;
  d1Pct: number;
  d7Pct: number;
  d30Pct: number;
}

export interface RetentionMetrics {
  cohorts: RetentionCohort[];
}

export interface ScreenTimeEntry {
  screenName: string;
  totalSeconds: number;
  viewCount: number;
  avgSeconds: number;
  pctOfTotal: number;
}

export interface ActionCountEntry {
  actionType: string;
  totalCount: number;
  uniqueUsers: number;
}

export interface FeatureMetrics {
  days: number;
  screenTime: ScreenTimeEntry[];
  actionCounts: ActionCountEntry[];
  matchupVoteRate: number;
}

export interface DailyContentCount {
  day: string;
  highlightsCreated: number;
  lifestylePostsCreated: number;
  uniqueCreators: number;
}

export interface ContentMetrics {
  days: number;
  totalHighlights: number;
  totalLifestylePosts: number;
  totalCreators: number;
  dailyContent: DailyContentCount[];
  creatorsToConsumersRatio: number;
}

export interface DailyActiveUsersEntry {
  day: string;
  activeUsers: number;
  totalSessions: number;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get real-time overview metrics.
 */
export const getOverviewMetrics = async (): Promise<OverviewMetrics> => {
  return authRequest<OverviewMetrics>(
    `${config.apiBaseUrl}/api/v1/internal/metrics/overview`
  );
};

/**
 * Get engagement metrics for the specified time period.
 */
export const getEngagementMetrics = async (
  days: number = 7
): Promise<EngagementMetrics> => {
  return authRequest<EngagementMetrics>(
    `${config.apiBaseUrl}/api/v1/internal/metrics/engagement?days=${days}`
  );
};

/**
 * Get D1/D7/D30 retention by signup cohort.
 */
export const getRetentionMetrics = async (
  weeks: number = 4
): Promise<RetentionMetrics> => {
  return authRequest<RetentionMetrics>(
    `${config.apiBaseUrl}/api/v1/internal/metrics/retention?weeks=${weeks}`
  );
};

/**
 * Get feature usage metrics.
 */
export const getFeatureMetrics = async (
  days: number = 30
): Promise<FeatureMetrics> => {
  return authRequest<FeatureMetrics>(
    `${config.apiBaseUrl}/api/v1/internal/metrics/features?days=${days}`
  );
};

/**
 * Get content health metrics.
 */
export const getContentMetrics = async (
  days: number = 7
): Promise<ContentMetrics> => {
  return authRequest<ContentMetrics>(
    `${config.apiBaseUrl}/api/v1/internal/metrics/content?days=${days}`
  );
};

/**
 * Get daily active users trend.
 */
export const getDauTrend = async (
  days: number = 30
): Promise<DailyActiveUsersEntry[]> => {
  return authRequest<DailyActiveUsersEntry[]>(
    `${config.apiBaseUrl}/api/v1/internal/metrics/dau-trend?days=${days}`
  );
};
