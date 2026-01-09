import { ChatBubble } from 'iconoir-react';

interface CommentButtonProps {
  commentCount: number;
  onClick: () => void;
  isLoading?: boolean;
}

export default function CommentButton({
  commentCount,
  onClick,
  isLoading = false,
}: CommentButtonProps) {
  // Format count (e.g., 1.2K for thousands)
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="
        flex items-center gap-1.5 px-3 py-1.5 rounded-full
        bg-black/60 backdrop-blur-sm
        hover:bg-black/70 transition-colors
        border-2 border-transparent
        disabled:opacity-50
        cursor-pointer
      "
      aria-label={`View ${commentCount} comments`}
    >
      <ChatBubble className="w-5 h-5 text-white/70" strokeWidth={2} />
      {commentCount > 0 && (
        <span className="text-sm text-white font-medium">
          {formatCount(commentCount)}
        </span>
      )}
    </button>
  );
}
