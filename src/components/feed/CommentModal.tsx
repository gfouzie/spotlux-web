import { useState, useRef, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import CommentItem from './CommentItem';
import { Comment } from '@/api/comments';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  totalCount: number;
  isLoading: boolean;
  hasMore: boolean;
  onAddComment: (text: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onLikeComment: (commentId: number) => Promise<void>;
  onUnlikeComment: (commentId: number) => Promise<void>;
  onLoadMore: () => Promise<void>;
}

const MAX_CHARS = 280;

export default function CommentModal({
  isOpen,
  onClose,
  comments,
  totalCount,
  isLoading,
  hasMore,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onUnlikeComment,
  onLoadMore,
}: CommentModalProps) {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Clear input when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInputText('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!inputText.trim() || isSubmitting || inputText.length > MAX_CHARS)
      return;

    setIsSubmitting(true);
    try {
      await onAddComment(inputText.trim());
      setInputText('');
      // Scroll to top to see new comment
      if (listRef.current) {
        listRef.current.scrollTop = 0;
      }
    } catch {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charsRemaining = MAX_CHARS - inputText.length;
  const isOverLimit = charsRemaining < 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Comments ${totalCount > 0 ? `(${totalCount})` : ''}`}
      size="md"
      showFooter={false}
    >
      <div className="flex flex-col h-[60vh] max-h-[500px]">
        {/* Comment input */}
        <div className="flex-shrink-0 pb-4 border-b border-bg-col/50">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 bg-component-col rounded-lg text-text-col placeholder-text-col/50 resize-none focus:outline-none focus:ring-2 focus:ring-accent-col/50"
              rows={2}
              maxLength={MAX_CHARS + 10} // Allow slight overage for better UX
            />
            <div className="flex items-center justify-between mt-2">
              <span
                className={`text-sm ${
                  isOverLimit
                    ? 'text-red-500'
                    : charsRemaining <= 20
                      ? 'text-yellow-500'
                      : 'text-text-col/50'
                }`}
              >
                {charsRemaining}
              </span>
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim() || isSubmitting || isOverLimit}
                className="px-4 py-1.5 bg-accent-col text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-col/80 transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>

        {/* Comments list */}
        <div ref={listRef} className="flex-1 overflow-y-auto mt-4">
          {isLoading && comments.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-text-col/60">Loading comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <span className="text-text-col/60">No comments yet</span>
              <span className="text-text-col/40 text-sm mt-1">
                Be the first to comment!
              </span>
            </div>
          ) : (
            <>
              <div className="divide-y divide-bg-col/30">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onLike={() => onLikeComment(comment.id)}
                    onUnlike={() => onUnlikeComment(comment.id)}
                    onDelete={() => onDeleteComment(comment.id)}
                  />
                ))}
              </div>

              {/* Load more button */}
              {hasMore && (
                <div className="py-4 text-center">
                  <button
                    onClick={onLoadMore}
                    disabled={isLoading}
                    className="text-accent-col text-sm font-medium hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Load more comments'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
