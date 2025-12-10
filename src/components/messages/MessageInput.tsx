'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import Button from '@/components/common/Button';
import { Send } from 'iconoir-react';

interface MessageInputProps {
  onSendMessage: (content: string, imageUrl?: string | null) => void;
  onTypingChange: (isTyping: boolean) => void;
  disabled?: boolean;
}

const MessageInput = ({
  onSendMessage,
  onTypingChange,
  disabled = false,
}: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle typing indicator
  const handleTypingChange = (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      onTypingChange(typing);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    // Start typing indicator
    if (value.trim() && !isTyping) {
      handleTypingChange(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 2 seconds of no typing
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingChange(false);
      }, 2000);
    } else {
      handleTypingChange(false);
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Handle send message
  const handleSend = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || disabled) return;

    onSendMessage(trimmedContent);
    setContent('');
    handleTypingChange(false);

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-text-col/10 flex-shrink-0">
      <div className="flex gap-3 items-start">
        {/* Text input */}
        <div className="flex-grow relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 bg-bg-col rounded-lg resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-accent-col disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px' }}
          />
          <div className="absolute right-3 bottom-3 text-xs text-text-col/40">
            {content.length > 0 && `${content.length}/1000`}
          </div>
        </div>

        {/* Send button with send iconoir-react */}
        <Button
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          variant="secondary"
          size="md"
        >
          <Send width={20} height={20} />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
