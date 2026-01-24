'use client';

import { useState, useRef, useEffect } from 'react';
import { LifestyleDailyAggregateFeedItem } from '@/api/lifestyle';
import LifestyleFeedPost from '@/components/lifestyle/LifestyleFeedPost';
import { formatDate } from '@/lib/dateUtils';

interface LifestyleItemProps {
  aggregate: LifestyleDailyAggregateFeedItem;
  isActive: boolean;
}

/**
 * Full-screen lifestyle aggregate item in unified feed
 * Displays user's daily posts in a horizontal carousel
 */
export default function LifestyleItem({ aggregate, isActive }: LifestyleItemProps) {
  // Backend sends posts DESC (newest first), reverse for chronological display
  const postsChronological = [...aggregate.posts].reverse();
  const totalSlides = postsChronological.length;

  // Start at the last slide (most recent post)
  const [currentSlide, setCurrentSlide] = useState(totalSlides - 1);
  const carouselRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Scroll to the last slide on mount (only once to prevent jarring updates)
  useEffect(() => {
    if (hasScrolledRef.current || totalSlides === 0) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    const slideWidth = carousel.offsetWidth;
    carousel.scrollTo({
      left: slideWidth * (totalSlides - 1),
      behavior: 'auto',
    });

    hasScrolledRef.current = true;
  }, [totalSlides]);

  // Handle scroll to update current slide indicator
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const slideWidth = carousel.offsetWidth;
      const newSlide = Math.round(scrollLeft / slideWidth);
      setCurrentSlide(newSlide);
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigate to specific slide
  const goToSlide = (index: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const slideWidth = carousel.offsetWidth;
    carousel.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth',
    });
  };

  // Guard against empty posts (after all hooks to comply with Rules of Hooks)
  if (postsChronological.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-muted-col">No posts for this day</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-sec-col flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* User Header */}
        <div className="flex items-center gap-3 mb-6">
          {aggregate.profileImageUrl ? (
            <img
              src={aggregate.profileImageUrl}
              alt={aggregate.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-bg-col flex items-center justify-center">
              <span className="text-text-muted-col text-lg font-medium">
                {aggregate.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-lg text-text-col">{aggregate.username}</p>
            <p className="text-sm text-text-muted-col">
              {aggregate.overallStreak > 0 && (
                <span className="text-accent-col mr-2">🔥 {aggregate.overallStreak}</span>
              )}
              {formatDate(aggregate.dayDate)}
            </p>
          </div>
        </div>

        {/* Posts Carousel */}
        <div className="bg-bg-col rounded-2xl p-8 min-h-[400px] flex items-center overflow-hidden">
          {postsChronological.length === 1 ? (
            // Single post - no carousel
            <div className="w-full">
              <LifestyleFeedPost post={postsChronological[0]} isCarouselSlide={false} />
            </div>
          ) : (
            // Multiple posts - horizontal carousel
            <div className="w-full">
              <div
                ref={carouselRef}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {postsChronological.map((post) => (
                  <div
                    key={post.id}
                    className="flex-shrink-0 w-full snap-center px-2"
                  >
                    <LifestyleFeedPost post={post} isCarouselSlide />
                  </div>
                ))}
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-1.5 mt-6">
                {postsChronological.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                      index === currentSlide
                        ? 'bg-accent-col'
                        : 'bg-text-col/30'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
