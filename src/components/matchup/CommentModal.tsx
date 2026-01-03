'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Modal from '@/components/common/Modal';

interface CommentModalProps {
  isOpen: boolean;
  votedFor: 'A' | 'B';
  onSubmit: (comment: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

/**
 * Modal for collecting optional comment after voting
 * User can submit vote (with or without comment) or cancel to not vote
 */
export default function CommentModal({
  isOpen,
  votedFor,
  onSubmit,
  onCancel,
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

  // Only render via portal when in browser and modal is open
  if (typeof document === 'undefined' || !isOpen) {
    return null;
  }

  const modalContent = (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
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
      confirmText={isSubmitting ? 'Submitting...' : 'Submit Vote'}
      cancelText="Cancel"
      onConfirm={handleSubmit}
      onCancel={onCancel}
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

  return createPortal(modalContent, document.body);
}
