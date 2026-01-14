'use client';

import { LifestylePostMinimal } from '@/api/lifestyle';
import { formatTime } from '@/lib/dateUtils';

interface LifestyleFeedPostProps {
  post: LifestylePostMinimal;
  isCarouselSlide?: boolean;
}

const LifestyleFeedPost = ({ post, isCarouselSlide = false }: LifestyleFeedPostProps) => {

  // Carousel slide layout - centered, prominent display
  if (isCarouselSlide) {
    return (
      <div className="flex flex-col items-center text-center min-h-[120px] justify-center">
        {/* Large Emoji */}
        <div className="text-5xl mb-3">
          {post.promptEmoji || '📝'}
        </div>

        {/* Activity name */}
        <div className="text-base font-semibold text-text-col mb-1">
          {post.promptName}
        </div>

        {/* Time content */}
        {post.timeContent && (
          <div className="text-sm text-accent-col font-medium mb-2">
            {formatTime(post.timeContent)}
          </div>
        )}

        {/* Text content */}
        {post.textContent && (
          <div className="text-sm text-text-muted-col max-w-[280px]">
            {post.textContent}
          </div>
        )}

        {/* Image */}
        {post.imageUrl && (
          <div className="mt-3">
            <img
              src={post.imageUrl}
              alt={post.promptName}
              className="w-full max-w-[200px] rounded-lg object-cover"
            />
          </div>
        )}
      </div>
    );
  }

  // Default inline layout (for non-carousel use)
  return (
    <div className="flex gap-3">
      {/* Emoji */}
      <div className="flex-shrink-0 text-2xl">
        {post.promptEmoji || '📝'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Activity name */}
        <div className="text-sm font-medium text-text-col">
          {post.promptName}
        </div>

        {/* Time content */}
        {post.timeContent && (
          <div className="text-xs text-text-muted-col mt-0.5">
            {formatTime(post.timeContent)}
          </div>
        )}

        {/* Text content */}
        {post.textContent && (
          <div className="text-sm text-text-muted-col mt-1">
            {post.textContent}
          </div>
        )}

        {/* Image thumbnail */}
        {post.imageUrl && (
          <div className="mt-2">
            <img
              src={post.imageUrl}
              alt={post.promptName}
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LifestyleFeedPost;
