import Modal from '@/components/common/Modal';
import { EMOJI_IDS, EMOJI_MAP, EmojiId, ReactionSummary } from '@/api/reactions';

interface ReactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reactions: ReactionSummary[];
  onReact: (emojiId: EmojiId) => void;
  onRemoveReaction: () => void;
}

export default function ReactionModal({
  isOpen,
  onClose,
  reactions,
  onReact,
  onRemoveReaction,
}: ReactionModalProps) {
  // Create a map of emoji counts for quick lookup
  const reactionMap = new Map(
    reactions.map((r) => [r.emoji, { count: r.count, userReacted: r.userReacted }])
  );

  const handleEmojiClick = (emojiId: EmojiId) => {
    const reaction = reactionMap.get(emojiId);

    if (reaction?.userReacted) {
      // User clicked their current reaction, remove it
      onRemoveReaction();
    } else {
      // Add or change reaction
      onReact(emojiId);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="React to Highlight"
      size="sm"
      showFooter={false}
    >
      <div className="grid grid-cols-4 gap-3">
        {EMOJI_IDS.map((emojiId) => {
          const reaction = reactionMap.get(emojiId);
          const count = reaction?.count || 0;
          const userReacted = reaction?.userReacted || false;

          return (
            <button
              key={emojiId}
              onClick={() => handleEmojiClick(emojiId)}
              className={`
                flex flex-col items-center justify-center
                p-3 rounded-lg
                bg-component-col hover:bg-bg-col/50
                transition-colors
                border-2
                ${userReacted ? 'border-accent-col' : 'border-transparent'}
              `}
              aria-label={`React with ${emojiId}`}
            >
              <span className="text-3xl mb-1">{EMOJI_MAP[emojiId]}</span>
              <span className="text-xs text-text-col/60">{count}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
