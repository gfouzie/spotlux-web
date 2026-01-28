/**
 * Shared content types for polymorphic reactions and comments.
 */

/**
 * Content types that support reactions and comments
 */
export type ContentType = 'highlights' | 'lifestyle-aggregates';

/**
 * Map content type to API path segment
 */
export const CONTENT_TYPE_PATHS: Record<ContentType, string> = {
  'highlights': 'highlights',
  'lifestyle-aggregates': 'lifestyle-aggregates',
};
