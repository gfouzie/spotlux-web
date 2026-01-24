'use client';

import { useState, useRef, useEffect } from 'react';
import { LifestyleDailyAggregateFeedItem } from '@/api/lifestyle';
import LifestyleFeedPost from './LifestyleFeedPost';
import { formatDate } from '@/lib/dateUtils';

interface LifestyleFeedCardProps {
  aggregate: LifestyleDailyAggregateFeedItem;
}

const LifestyleFeedCard = ({ aggregate }: LifestyleFeedCardProps) => {
  // Backend sends posts DESC (newest first), reverse for chronological display (oldest to newest)
  const postsChronological = [...aggregate.posts].reverse();
  const totalSlides = postsChronological.length;

  // Start at the last slide (most recent post after reversing)
  const [currentSlide, setCurrentSlide] = useState(totalSlides - 1);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Scroll to the last slide on mount (most recent post)
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const slideWidth = carousel.offsetWidth;
    carousel.scrollTo({
      left: slideWidth * (totalSlides - 1),
      behavior: 'auto', // Instant scroll on mount
    });
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

  return (
    <div className="bg-bg-sec-col border border-border-col rounded-lg overflow-hidden">
      {/* Header: Avatar, Username, Streak, Date */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {aggregate.profileImageUrl ? (
            <img
              src={aggregate.profileImageUrl}
              alt={aggregate.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-bg-col flex items-center justify-center">
              <span className="text-text-muted-col text-sm font-medium">
                {aggregate.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Username and Date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-col truncate">
              {aggregate.username}
            </span>
            {aggregate.overallStreak > 0 && (
              <span className="text-xs text-accent-col flex-shrink-0">
                🔥 {aggregate.overallStreak}
              </span>
            )}
          </div>
          <div className="text-xs text-text-muted-col">
            {formatDate(aggregate.dayDate)}
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {postsChronological.map((post) => (
          <div
            key={post.id}
            className="flex-shrink-0 w-full snap-center px-4 py-4"
          >
            <LifestyleFeedPost post={post} isCarouselSlide />
          </div>
        ))}
      </div>

      {/* Dot Indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-1.5 pb-4">
          {postsChronological.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${
                index === currentSlide
                  ? 'bg-accent-col'
                  : 'bg-text-col/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LifestyleFeedCard;
