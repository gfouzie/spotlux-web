'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useLifestyleFeedData } from '@/hooks/useLifestyleFeedData';
import { lifestyleApi } from '@/api/lifestyle';
import LifestyleFeedCard from './LifestyleFeedCard';

const LifestyleFeedPage = () => {
  const { items, isLoading, isLoadingMore, hasMore, error, loadMore } =
    useLifestyleFeedData();

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const viewedAggregates = useRef<Set<number>>(new Set());
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const viewTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Track view for an aggregate (only once)
  const trackView = useCallback(async (aggregateId: number) => {
    if (viewedAggregates.current.has(aggregateId)) return;

    viewedAggregates.current.add(aggregateId);
    try {
      await lifestyleApi.trackAggregateView(aggregateId);
    } catch (err) {
      console.error('Failed to track aggregate view:', err);
      // Remove from set if tracking failed
      viewedAggregates.current.delete(aggregateId);
    }
  }, []);

  // Set up IntersectionObserver for view tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const aggregateId = Number(entry.target.getAttribute('data-aggregate-id'));
          if (!aggregateId) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Card is at least 50% visible - start timer
            if (!viewTimers.current.has(aggregateId)) {
              const timer = setTimeout(() => {
                trackView(aggregateId);
                viewTimers.current.delete(aggregateId);
              }, 1000); // Track after 1 second of visibility
              viewTimers.current.set(aggregateId, timer);
            }
          } else {
            // Card is no longer visible - cancel timer
            const timer = viewTimers.current.get(aggregateId);
            if (timer) {
              clearTimeout(timer);
              viewTimers.current.delete(aggregateId);
            }
          }
        });
      },
      {
        threshold: [0.5],
        rootMargin: '0px',
      }
    );

    // Observe all cards
    cardRefs.current.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      // Clear all timers
      viewTimers.current.forEach((timer) => clearTimeout(timer));
      viewTimers.current.clear();
      observer.disconnect();
    };
  }, [items, trackView]);

  // Infinite scroll with IntersectionObserver
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    },
    [hasMore, isLoadingMore, loadMore]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleObserver]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-bg-sec-col border border-border-col rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-bg-col" />
              <div className="flex-1">
                <div className="h-4 bg-bg-col rounded w-24 mb-2" />
                <div className="h-3 bg-bg-col rounded w-32" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-bg-col rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-bg-col rounded w-20 mb-1" />
                  <div className="h-3 bg-bg-col rounded w-32" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-bg-col rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-bg-col rounded w-24 mb-1" />
                  <div className="h-3 bg-bg-col rounded w-40" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-text-muted-col mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-accent-col hover:underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-text-col font-medium mb-2">No lifestyle posts yet</p>
          <p className="text-text-muted-col text-sm">
            Be the first to share your daily routine!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {items.map((aggregate) => (
        <div
          key={aggregate.id}
          ref={(el) => {
            if (el) {
              cardRefs.current.set(aggregate.id, el);
            } else {
              cardRefs.current.delete(aggregate.id);
            }
          }}
          data-aggregate-id={aggregate.id}
        >
          <LifestyleFeedCard aggregate={aggregate} />
        </div>
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-4" />

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="text-text-muted-col text-sm">Loading more...</div>
        </div>
      )}

      {/* End of feed */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-4">
          <p className="text-text-muted-col text-sm">You&apos;re all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default LifestyleFeedPage;
