'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';

interface CommentModalProps {
  isOpen: boolean;
  votedFor: 'A' | 'B';
  onSubmit: (comment: string) => void;
  onSkip: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

/**
 * Modal for collecting optional comment after voting
 */
export default function CommentModal({
  isOpen,
  votedFor,
  onSubmit,
  onSkip,
  isSubmitting = false,
  error = null,
}: CommentModalProps) {
  const [comment, setComment] = useState('');

  // Reset comment when modal opens
  useEffect(() => {
    if (isOpen) {
      setComment('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit(comment);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onSkip}
      title={
        <div className="text-center w-full">
          <p className="text-text-col/60 text-sm mb-1">You chose</p>
          <p className="text-text-col text-xl font-medium">Highlight {votedFor}</p>
        </div>
      }
      size="md"
      showCloseButton={false}
      closeOnOverlayClick={!isSubmitting}
      showFooter
      confirmText={isSubmitting ? 'Submitting...' : 'Submit'}
      cancelText="Skip"
      onConfirm={handleSubmit}
      onCancel={onSkip}
      confirmDisabled={isSubmitting}
      cancelDisabled={isSubmitting}
      confirmLoading={isSubmitting}
      confirmVariant="primary"
    >
      {/* Comment Input */}
      <div className="mb-4">
        <label htmlFor="comment-input" className="block text-text-col text-sm mb-2">
          Why did you choose this one? (optional)
        </label>
        <textarea
          id="comment-input"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          maxLength={500}
          disabled={isSubmitting}
          autoFocus
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text-col placeholder:text-text-col/40 focus:outline-none focus:ring-2 focus:ring-accent-col resize-none disabled:opacity-50"
        />
        <p className="text-text-col/40 text-xs mt-1 text-right">
          {comment.length}/500
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}
    </Modal>
  );
}
