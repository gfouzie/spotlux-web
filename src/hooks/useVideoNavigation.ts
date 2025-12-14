import { useCallback, useEffect } from 'react';

interface UseVideoNavigationOptions {
  currentIndex: number;
  totalItems: number;
  onNavigate: (newIndex: number) => void;
  enableKeyboard?: boolean;
  enableTouch?: boolean;
}

interface UseVideoNavigationReturn {
  goToNext: () => void;
  goToPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * Custom hook for video navigation (keyboard, touch, next/prev)
 *
 * Features:
 * - Arrow key navigation (up/down)
 * - Touch/swipe navigation
 * - Next/previous callbacks
 * - Boundary detection (first/last)
 */
export function useVideoNavigation({
  currentIndex,
  totalItems,
  onNavigate,
  enableKeyboard = true,
  enableTouch = true,
}: UseVideoNavigationOptions): UseVideoNavigationReturn {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalItems - 1;

  const goToNext = useCallback(() => {
    if (!isLast) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, isLast, onNavigate]);

  const goToPrevious = useCallback(() => {
    if (!isFirst) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, isFirst, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        goToNext();
      } else if (e.key === 'ArrowUp') {
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, goToNext, goToPrevious]);

  // Touch/swipe navigation
  useEffect(() => {
    if (!enableTouch) return;

    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) {
        // Swipe threshold
        if (diff > 0) {
          // Swiped up - next
          goToNext();
        } else {
          // Swiped down - previous
          goToPrevious();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enableTouch, goToNext, goToPrevious]);

  return {
    goToNext,
    goToPrevious,
    isFirst,
    isLast,
  };
}
