'use client';

import { useEffect, useRef } from 'react';
import { MessageWithSender } from '@/api/conversations';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageThreadProps {
  messages: MessageWithSender[];
  currentUserId: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onMarkAsRead?: (messageId: number) => void;
  isOtherUserTyping?: boolean;
  onMatchupUpdated?: () => void;
}

const MessageThread = ({
  messages,
  currentUserId,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  onMarkAsRead,
  isOtherUserTyping = false,
  onMatchupUpdated,
}: MessageThreadProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef<number>(0);
  const markedAsReadRef = useRef<Set<number>>(new Set());
  const prevMessagesLengthRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);
  const scrollToBottomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to scroll to bottom
  const scrollToBottom = (behavior: 'instant' | 'smooth' = 'smooth') => {
    const container = messagesContainerRef.current;
    if (container) {
      // Directly set scrollTop instead of scrollIntoView to prevent page scrolling
      const scrollOptions: ScrollToOptions = {
        top: container.scrollHeight,
        behavior: behavior === 'instant' ? 'auto' : 'smooth',
      };
      container.scrollTo(scrollOptions);
    }
  };

  // Auto-scroll to bottom when conversation changes or on initial load
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      const container = messagesContainerRef.current;
      if (container) {
        // Check if messages were prepended (pagination) or appended (new messages)
        const messagesPrepended =
          messages.length > prevMessagesLengthRef.current &&
          prevScrollHeight.current > 0;

        // Always scroll to bottom on initial load or conversation change
        if (isInitialLoadRef.current) {
          // Initial load - scroll to bottom immediately
          scrollToBottom('instant');
          isInitialLoadRef.current = false;
        } else if (!messagesPrepended) {
          // New messages arrived (not pagination) - always scroll to bottom
          scrollToBottom('smooth');

          // Also scroll again after a short delay to handle images loading
          // Clear any existing timeout first
          if (scrollToBottomTimeoutRef.current) {
            clearTimeout(scrollToBottomTimeoutRef.current);
          }
          scrollToBottomTimeoutRef.current = setTimeout(() => {
            scrollToBottom('smooth');
          }, 100);
        }

        prevMessagesLengthRef.current = messages.length;
      }
    }
  }, [messages]);

  // Auto-scroll when typing indicator appears/disappears
  useEffect(() => {
    if (isOtherUserTyping) {
      scrollToBottom('smooth');
    }
  }, [isOtherUserTyping]);

  // Reset initial load flag when messages array becomes empty (conversation changed)
  useEffect(() => {
    if (messages.length === 0) {
      isInitialLoadRef.current = true;
      prevMessagesLengthRef.current = 0;
      markedAsReadRef.current.clear();
    }
  }, [messages.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollToBottomTimeoutRef.current) {
        clearTimeout(scrollToBottomTimeoutRef.current);
      }
    };
  }, []);

  // Handle scroll to load more messages
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || !onLoadMore || !hasMore || isLoading) return;

    // Load more when scrolled to top
    if (container.scrollTop === 0) {
      prevScrollHeight.current = container.scrollHeight;
      onLoadMore();
    }
  };

  // Restore scroll position after loading more messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && prevScrollHeight.current > 0) {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeight.current;
      container.scrollTop = scrollDiff;
      prevScrollHeight.current = 0;
    }
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    if (!onMarkAsRead) return;

    // Mark all unread messages that were sent by others as read
    messages.forEach((message) => {
      // Only mark messages from others that haven't been read yet
      if (
        message.senderId !== currentUserId &&
        !message.isRead &&
        !markedAsReadRef.current.has(message.id)
      ) {
        markedAsReadRef.current.add(message.id);
        onMarkAsRead(message.id);
      }
    });
  }, [messages, currentUserId, onMarkAsRead]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-text-col/60 mb-2">No messages yet</p>
          <p className="text-sm text-text-col/40">
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto p-4 bg-gradient-to-b from-bg-col/20 to-transparent"
    >
      {/* Load more indicator */}
      {hasMore && (
        <div className="text-center py-2">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-sm text-accent-col hover:underline disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load older messages'}
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <MessageBubble
          key={message.id || Math.random()}
          message={message}
          currentUserId={currentUserId}
          onMatchupUpdated={onMatchupUpdated}
        />
      ))}

      {/* Typing indicator */}
      {isOtherUserTyping && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageThread;
