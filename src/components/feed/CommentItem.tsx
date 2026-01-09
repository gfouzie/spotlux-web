import { useState } from 'react';
import { Heart, HeartSolid, Trash } from 'iconoir-react';
import { Comment } from '@/api/comments';
import { useUser } from '@/contexts/UserContext';

interface CommentItemProps {
  comment: Comment;
  onLike: () => void;
  onUnlike: () => void;
  onDelete: () => void;
}

export default function CommentItem({
  comment,
  onLike,
  onUnlike,
  onDelete,
}: CommentItemProps) {
  const { user } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnComment = user?.id === comment.author.id;

  const handleLikeToggle = () => {
    if (comment.userLiked) {
      onUnlike();
    } else {
      onLike();
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  // Format relative time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex gap-3 py-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.author.profileImageUrl ? (
          <img
            src={comment.author.profileImageUrl}
            alt={`${comment.author.firstName} ${comment.author.lastName}`}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-bg-col flex items-center justify-center">
            <span className="text-sm font-medium text-text-col/60">
              {comment.author.firstName?.[0] || '?'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-text-col">
            {comment.author.firstName} {comment.author.lastName}
          </span>
          <span className="text-text-col/50">
            {formatTime(comment.createdAt)}
          </span>
        </div>

        {/* Comment text */}
        <p className="text-text-col mt-1 break-words">{comment.text}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2">
          {/* Like button */}
          <button
            onClick={handleLikeToggle}
            className="flex items-center gap-1 text-sm text-text-col/60 hover:text-text-col transition-colors cursor-pointer"
            aria-label={comment.userLiked ? 'Unlike comment' : 'Like comment'}
          >
            {comment.userLiked ? (
              <HeartSolid className="w-4 h-4 text-red-500" />
            ) : (
              <Heart className="w-4 h-4" strokeWidth={2} />
            )}
            {comment.likeCount > 0 && (
              <span className={comment.userLiked ? 'text-red-500' : ''}>
                {comment.likeCount}
              </span>
            )}
          </button>

          {/* Delete button (own comments only) */}
          {isOwnComment && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 text-sm text-text-col/60 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Delete comment"
            >
              <Trash className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
