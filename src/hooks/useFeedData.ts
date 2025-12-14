import { useState, useEffect, useCallback } from 'react';
import { feedApi } from '@/api/feed';
import { Highlight } from '@/api/highlights';

const INITIAL_LOAD_COUNT = 10;
const LOAD_MORE_COUNT = 5;
const LOAD_MORE_THRESHOLD = 3;

interface UseFeedDataReturn {
  highlights: Highlight[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  loadInitialHighlights: () => Promise<void>;
  trackView: (highlightId: number) => Promise<void>;
}

/**
 * Custom hook for feed data management
 *
 * Features:
 * - Initial feed loading
 * - Infinite scroll (automatic load more)
 * - View tracking
 * - Error handling
 */
export function useFeedData(): UseFeedDataReturn {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial highlights
  const loadInitialHighlights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await feedApi.getFeedHighlights({
        offset: 0,
        limit: INITIAL_LOAD_COUNT,
      });
      setHighlights(data);
      setHasMore(data.length >= INITIAL_LOAD_COUNT);
    } catch (err) {
      console.error('Failed to load feed:', err);
      setError('Failed to load feed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load more highlights when approaching end
  const loadMoreHighlights = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      const data = await feedApi.getFeedHighlights({
        offset: highlights.length,
        limit: LOAD_MORE_COUNT,
      });

      if (data.length > 0) {
        setHighlights((prev) => [...prev, ...data]);
        setHasMore(data.length >= LOAD_MORE_COUNT);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more highlights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, highlights.length]);

  // Track view for current highlight
  const trackView = useCallback(async (highlightId: number) => {
    try {
      await feedApi.trackHighlightView(highlightId);
      console.log(`Tracked view for highlight ${highlightId}`);
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  }, []);

  // Auto-load initial highlights on mount
  useEffect(() => {
    loadInitialHighlights();
  }, [loadInitialHighlights]);

  // Check if we need to load more (infinite scroll)
  useEffect(() => {
    if (hasMore && highlights.length - currentIndex <= LOAD_MORE_THRESHOLD) {
      loadMoreHighlights();
    }
  }, [currentIndex, highlights.length, hasMore, loadMoreHighlights]);

  return {
    highlights,
    isLoading,
    hasMore,
    error,
    currentIndex,
    setCurrentIndex,
    loadInitialHighlights,
    trackView,
  };
}
