'use client';

import { useState, useEffect, useRef } from 'react';
import { useUnifiedFeed } from '@/hooks/useUnifiedFeed';
import HighlightItem from './HighlightItem';
import MatchupItem from './MatchupItem';
import LifestyleItem from './LifestyleItem';
import LoadingState from '@/components/common/LoadingState';
import Alert from '@/components/common/Alert';

export default function UnifiedFeedPage() {
  const { items, isLoading, hasMore, error, loadMore } = useUnifiedFeed();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('[UnifiedFeedPage] State:', {
      itemsCount: items.length,
      isLoading,
      hasMore,
      error
    });
  }, [items.length, isLoading, hasMore, error]);

  // Calculate container height (full viewport - header - footer)
  const HEADER_HEIGHT = 36; // px
  const FOOTER_HEIGHT = 54; // px
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  useEffect(() => {
    const calculateHeight = () => {
      if (typeof window === 'undefined') return 0;
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        return window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
      }

      // Desktop: full viewport
      return window.innerHeight;
    };

    setContainerHeight(calculateHeight());

    const handleResize = () => {
      setContainerHeight(calculateHeight());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Intersection observer to detect current visible item
  useEffect(() => {
    if (!containerRef.current) return;

    const options = {
      root: containerRef.current,
      threshold: 0.5, // Item is "current" when 50% visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          setCurrentIndex(index);
        }
      });
    }, options);

    // Observe items in buffer range, unobserve items outside buffer to prevent memory leak
    const itemElements = containerRef.current.querySelectorAll('[data-index]');
    itemElements.forEach((el, index) => {
      if (Math.abs(index - currentIndex) <= 2) {
        observer.observe(el);
      } else {
        // Explicitly unobserve items outside buffer range
        observer.unobserve(el);
      }
    });

    return () => observer.disconnect();
  }, [items.length, currentIndex]);

  // Trigger load more when approaching end
  useEffect(() => {
    if (items.length === 0) return;

    const remainingItems = items.length - currentIndex;
    // Add error check to prevent infinite loop if loadMore fails repeatedly
    if (hasMore && !isLoading && !error && remainingItems <= 2) {
      loadMore();
    }
  }, [currentIndex, items.length, hasMore, isLoading, error, loadMore]);

  // Show initial loading state
  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingState message="Loading feed..." />
      </div>
    );
  }

  // Show error state (initial load)
  if (error && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  // Show empty state
  if (!isLoading && items.length === 0 && !hasMore) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-text-muted-col text-center">
          No content available
          <br />
          <span className="text-sm">Check back later!</span>
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="main"
      aria-label="Content feed"
      aria-busy={isLoading}
      className="snap-y snap-mandatory overflow-y-scroll h-screen scrollbar-hide"
      style={{ scrollBehavior: 'smooth' }}
    >
      {items.map((item, index) => {
        const isActive = index === currentIndex;
        const inBuffer = Math.abs(index - currentIndex) <= 1;

        return (
          <div
            key={item.id} // Use composite ID (already unique)
            data-index={index}
            className="snap-start snap-always"
            style={{ height: containerHeight || '100vh' }}
          >
            {!inBuffer ? (
              // Render placeholder to maintain layout
              <div style={{ height: containerHeight || '100vh' }} />
            ) : (
              <>
                {item.type === 'highlight' && (
                  <HighlightItem highlight={item.data} isActive={isActive} />
                )}
                {item.type === 'matchup' && (
                  <MatchupItem matchup={item.data} isActive={isActive} />
                )}
                {item.type === 'lifestyle' && (
                  <LifestyleItem aggregate={item.data} isActive={isActive} />
                )}
              </>
            )}
          </div>
        );
      })}

      {/* Loading indicator for infinite scroll */}
      {isLoading && items.length > 0 && (
        <div
          className="flex items-center justify-center"
          style={{ height: containerHeight || '100vh' }}
        >
          <LoadingState message="Loading more..." />
        </div>
      )}

      {/* Error recovery for mid-scroll failures */}
      {error && items.length > 0 && (
        <div
          className="flex flex-col items-center justify-center gap-4 p-4"
          style={{ height: containerHeight || '100vh' }}
        >
          <Alert variant="error">{error}</Alert>
          <button
            onClick={() => loadMore()}
            className="px-4 py-2 bg-accent-col text-white rounded-lg hover:bg-accent-col/80 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* All caught up message */}
      {!hasMore && items.length > 0 && (
        <div
          className="flex flex-col items-center justify-center"
          style={{ height: containerHeight || '100vh' }}
        >
          <p className="text-text-muted-col text-center">
            🎉 You&apos;re all caught up!
            <br />
            <span className="text-sm">Check back later for more content</span>
          </p>
        </div>
      )}
    </div>
  );
}
