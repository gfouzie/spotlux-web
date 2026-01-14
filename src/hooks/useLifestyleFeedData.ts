import { useState, useEffect, useCallback, useRef } from 'react';
import { lifestyleApi, LifestyleDailyAggregateFeedItem } from '@/api/lifestyle';

const INITIAL_LOAD_COUNT = 10;
const LOAD_MORE_COUNT = 10;

interface UseLifestyleFeedDataReturn {
  items: LifestyleDailyAggregateFeedItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for lifestyle feed data management
 *
 * Features:
 * - Initial feed loading
 * - Infinite scroll with cursor pagination
 * - Pull to refresh
 * - Error handling
 */
export function useLifestyleFeedData(): UseLifestyleFeedDataReturn {
  const [items, setItems] = useState<LifestyleDailyAggregateFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);

  // Ref to prevent duplicate initial loads in React StrictMode
  const hasInitialized = useRef(false);

  // Load initial feed items
  const loadInitial = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await lifestyleApi.getFeed(undefined, INITIAL_LOAD_COUNT);
      setItems(response.items);
      setHasMore(response.hasMore);
      setCursor(response.nextCursor);
    } catch (err) {
      console.error('Failed to load lifestyle feed:', err);
      setError('Failed to load feed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load more items for infinite scroll
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || cursor === null) {
      return;
    }

    try {
      setIsLoadingMore(true);
      const response = await lifestyleApi.getFeed(cursor, LOAD_MORE_COUNT);

      if (response.items.length > 0) {
        setItems((prev) => [...prev, ...response.items]);
        setHasMore(response.hasMore);
        setCursor(response.nextCursor);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more lifestyle feed:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, cursor]);

  // Refresh feed (pull to refresh)
  const refresh = useCallback(async () => {
    setCursor(null);
    setHasMore(true);
    await loadInitial();
  }, [loadInitial]);

  // Auto-load initial items on mount (only once)
  useEffect(() => {
    // Prevent duplicate loads in React StrictMode
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadInitial,
    loadMore,
    refresh,
  };
}
