import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { authRequest } from './client';

// ============================================================
// Lifestyle Prompt Types
// ============================================================

export interface LifestylePrompt {
  id: number;
  name: string;
  promptType: 'time' | 'text' | 'text_image';
  emoji?: string;
  description?: string;
  categoryId?: number;
  displayOrder: number;
  createdAt: string;
  // Per-prompt streak (populated when fetching prompts for the current user)
  currentStreak?: number;
}

export interface LifestylePromptCategory {
  id: number;
  name: string;
  displayOrder: number;
  prompts: LifestylePrompt[];
}

// ============================================================
// Lifestyle Post Types
// ============================================================

export interface LifestylePostMinimal {
  id: number;
  promptId: number;
  textContent?: string;
  timeContent?: string; // Time as "HH:MM:SS" string
  imageUrl?: string;
  visibility: 'private' | 'friends_only' | 'public';
  postedAt: string;
  promptEmoji?: string;
  promptName: string;
}

export interface LifestylePostCreate {
  promptId: number;
  textContent?: string;
  timeContent?: string; // "HH:MM:SS" format
  imageUrl?: string;
  visibility?: 'private' | 'friends_only' | 'public'; // Default: public
  timezoneOffset?: number; // Browser timezone offset in minutes
}

export interface LifestylePostUpdate {
  visibility: 'private' | 'friends_only' | 'public';
}

// ============================================================
// Lifestyle Daily Aggregate Types
// ============================================================

export type LifestyleVisibility = 'private' | 'friends_only' | 'public';

export interface LifestyleDailyAggregate {
  id: number;
  userId: number;
  dayDate: string; // "YYYY-MM-DD"
  postCount: number;
  visibility: LifestyleVisibility;
  createdAt: string;
  posts: LifestylePostMinimal[];
}

export interface LifestyleDailyAggregateCreate {
  visibility: LifestyleVisibility;
}

export interface LifestyleDailyAggregateFeedItem extends LifestyleDailyAggregate {
  username: string;
  profileImageUrl?: string;
  overallStreak: number;
}

export interface LifestyleFeedResponse {
  items: LifestyleDailyAggregateFeedItem[];
  nextCursor: number | null;
  hasMore: boolean;
}

// ============================================================
// Lifestyle Streak Types
// ============================================================

export interface LifestyleOverallStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
}

export interface LifestyleStreakRead {
  id: number;
  userId: number;
  promptId?: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  promptEmoji?: string;
  promptName?: string;
}

export interface LifestyleStreaksResponse {
  overall: LifestyleOverallStreak;
  prompts: LifestyleStreakRead[];
}

// ============================================================
// Lifestyle Calendar Types
// ============================================================

export interface CalendarDate {
  dayDate: string; // "YYYY-MM-DD"
  postCount: number;
  visibility: LifestyleVisibility;
  aggregateId: number | null;
}

// ============================================================
// Lifestyle Insights Types
// ============================================================

export interface WakeTimeInsight {
  avgWakeTime: string | null; // "HH:MM:SS" format or null
  daysAnalyzed: number;
  daysWithData: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
}

export interface SleepTimeInsight {
  avgSleepTime: string | null; // "HH:MM:SS" format or null
  daysAnalyzed: number;
  daysWithData: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
}

export interface SleepDurationInsight {
  avgDurationHours: number | null;
  daysAnalyzed: number;
  daysWithData: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
}

// ============================================================
// API Methods
// ============================================================

export const lifestyleApi = {
  // ----------------------------------------------------------
  // Prompts
  // ----------------------------------------------------------

  /**
   * Get all lifestyle prompts grouped by category with streak data
   */
  async getPromptsByCategory(): Promise<LifestylePromptCategory[]> {
    return authRequest<LifestylePromptCategory[]>(
      `${config.apiBaseUrl}/api/v1/lifestyle-prompts`
    );
  },

  // ----------------------------------------------------------
  // Posts (Today's posts)
  // ----------------------------------------------------------

  /**
   * Get current user's unpublished posts for today
   */
  async getTodaysPosts(timezoneOffset?: number): Promise<LifestylePostMinimal[]> {
    const queryParams = buildQueryParams({
      timezoneOffset,
    });
    const url = `${config.apiBaseUrl}/api/v1/lifestyle-posts/today${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return authRequest<LifestylePostMinimal[]>(url);
  },

  /**
   * Create a lifestyle post (Add to Day)
   * This updates the per-prompt streak
   * Automatically syncs user's timezone if changed (for travelers)
   */
  async createPost(post: LifestylePostCreate): Promise<LifestylePostMinimal> {
    // Get user's current timezone for auto-sync
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return authRequest<LifestylePostMinimal>(
      `${config.apiBaseUrl}/api/v1/lifestyle-posts`,
      {
        method: 'POST',
        headers: {
          'X-Timezone': timezone,
        },
        body: JSON.stringify(post),
      }
    );
  },

  /**
   * Delete a lifestyle post (only if not yet published)
   */
  async deletePost(postId: number): Promise<void> {
    await authRequest<void>(
      `${config.apiBaseUrl}/api/v1/lifestyle-posts/${postId}`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Update a lifestyle post's visibility
   */
  async updatePost(
    postId: number,
    data: LifestylePostUpdate
  ): Promise<LifestylePostMinimal> {
    return authRequest<LifestylePostMinimal>(
      `${config.apiBaseUrl}/api/v1/lifestyle-posts/${postId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  // ----------------------------------------------------------
  // Daily Aggregates
  // ----------------------------------------------------------

  /**
   * Get a specific daily aggregate
   */
  async getAggregate(aggregateId: number): Promise<LifestyleDailyAggregate> {
    return authRequest<LifestyleDailyAggregate>(
      `${config.apiBaseUrl}/api/v1/lifestyle-aggregates/${aggregateId}`
    );
  },

  // ----------------------------------------------------------
  // Feed
  // ----------------------------------------------------------

  /**
   * Get lifestyle feed with cursor-based pagination
   */
  async getFeed(cursor?: number, limit: number = 10): Promise<LifestyleFeedResponse> {
    const queryParams = buildQueryParams({
      cursor,
      limit,
    });
    const url = `${config.apiBaseUrl}/api/v1/lifestyle-feed${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return authRequest<LifestyleFeedResponse>(url);
  },

  /**
   * Track that the user has viewed a lifestyle aggregate
   *
   * This is idempotent - calling it multiple times for the same aggregate
   * will not create duplicate view records.
   */
  async trackAggregateView(aggregateId: number): Promise<void> {
    return authRequest<void>(
      `${config.apiBaseUrl}/api/v1/lifestyle-aggregates/${aggregateId}/view`,
      {
        method: 'POST',
      }
    );
  },

  // ----------------------------------------------------------
  // Streaks
  // ----------------------------------------------------------

  /**
   * Get all user's streaks (overall and per-prompt)
   */
  async getAllStreaks(): Promise<LifestyleStreaksResponse> {
    return authRequest<LifestyleStreaksResponse>(
      `${config.apiBaseUrl}/api/v1/lifestyle-streaks`
    );
  },

  /**
   * Get user's overall lifestyle streak
   */
  async getOverallStreak(): Promise<LifestyleOverallStreak> {
    return authRequest<LifestyleOverallStreak>(
      `${config.apiBaseUrl}/api/v1/lifestyle-streaks/overall`
    );
  },

  // ----------------------------------------------------------
  // Calendar
  // ----------------------------------------------------------

  /**
   * Get lifestyle calendar data for a user
   *
   * Returns daily aggregates for a date range, filling gaps with zero-count entries.
   *
   * @param userId - User whose calendar to fetch
   * @param startDate - Start date (YYYY-MM-DD format, defaults to 30 days ago)
   * @param endDate - End date (YYYY-MM-DD format, defaults to today)
   * @param timezoneOffset - Browser timezone offset in minutes
   */
  async getCalendar(
    userId: number,
    startDate?: string,
    endDate?: string,
    timezoneOffset?: number
  ): Promise<CalendarDate[]> {
    const queryParams = buildQueryParams({
      startDate,
      endDate,
      timezoneOffset,
    });
    const url = `${config.apiBaseUrl}/api/v1/users/${userId}/lifestyle/calendar${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return authRequest<CalendarDate[]>(url);
  },

  // ----------------------------------------------------------
  // Insights
  // ----------------------------------------------------------

  /**
   * Get average wake time insight for the current user
   *
   * @param days - Number of days to analyze (default 7)
   * @param timezoneOffset - Browser timezone offset in minutes (optional)
   */
  async getWakeTimeInsight(days: number = 7, timezoneOffset?: number): Promise<WakeTimeInsight> {
    const queryParams = buildQueryParams({ days, timezoneOffset });
    const url = `${config.apiBaseUrl}/api/v1/lifestyle/insights/wake-time${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return authRequest<WakeTimeInsight>(url);
  },

  /**
   * Get average sleep time (bedtime) insight for the current user
   *
   * @param days - Number of days to analyze (default 7)
   * @param timezoneOffset - Browser timezone offset in minutes (optional)
   */
  async getSleepTimeInsight(days: number = 7, timezoneOffset?: number): Promise<SleepTimeInsight> {
    const queryParams = buildQueryParams({ days, timezoneOffset });
    const url = `${config.apiBaseUrl}/api/v1/lifestyle/insights/sleep-time${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return authRequest<SleepTimeInsight>(url);
  },

  /**
   * Get average sleep duration insight for the current user
   *
   * @param days - Number of days to analyze (default 7)
   * @param timezoneOffset - Browser timezone offset in minutes (optional)
   */
  async getSleepDurationInsight(days: number = 7, timezoneOffset?: number): Promise<SleepDurationInsight> {
    const queryParams = buildQueryParams({ days, timezoneOffset });
    const url = `${config.apiBaseUrl}/api/v1/lifestyle/insights/sleep-duration${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return authRequest<SleepDurationInsight>(url);
  },
};
