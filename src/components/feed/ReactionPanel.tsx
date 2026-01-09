import { EMOJI_MAP, EmojiId, ReactionSummary } from '@/api/reactions';
import { Emoji } from 'iconoir-react';

interface ReactionPanelProps {
  highlightId: number;
  reactions: ReactionSummary[];
  isLoading: boolean;
  onReact: (emojiId: EmojiId) => void;
  onRemoveReaction: () => void;
  onOpenModal: () => void;
}

export default function ReactionPanel({
  reactions,
  isLoading,
  onReact,
  onRemoveReaction,
  onOpenModal,
}: ReactionPanelProps) {
  // Get top 3 reactions sorted by count
  const topReactions = reactions.slice(0, 3);

  const handleReactionClick = (emojiId: EmojiId, userReacted: boolean) => {
    if (userReacted) {
      // User already reacted with this emoji, remove it
      onRemoveReaction();
    } else {
      // Add or change reaction
      onReact(emojiId);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="absolute bottom-24 left-4 z-20 flex items-center gap-2">
      {/* Top 3 reactions */}
      {topReactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => handleReactionClick(reaction.emoji, reaction.userReacted)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full
            bg-black/60 backdrop-blur-sm
            hover:bg-black/70 transition-colors
            border-2
            ${reaction.userReacted ? 'border-accent-col' : 'border-transparent'}
          `}
          aria-label={`React with ${reaction.emoji}`}
        >
          <span className="text-lg">{EMOJI_MAP[reaction.emoji]}</span>
          <span className="text-sm text-white font-medium">{reaction.count}</span>
        </button>
      ))}

      {/* Grey smiley button to open modal */}
      <button
        onClick={onOpenModal}
        className="
          flex items-center justify-center
          w-9 h-9 rounded-full
          bg-black/60 backdrop-blur-sm
          hover:bg-black/70 transition-colors
          border-2 border-transparent
        "
        aria-label="View all reactions"
      >
        <Emoji className="w-5 h-5 text-white/70" strokeWidth={2} />
      </button>
    </div>
  );
}
