'use client';

import { useEffect, useRef } from 'react';
import { MessageWithSender } from '@/api/conversations';
import MessageBubble from './MessageBubble';

interface MessageThreadProps {
  messages: MessageWithSender[];
  currentUserId: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onEditMessage?: (messageId: number, content: string) => void;
  onDeleteMessage?: (messageId: number) => void;
  onMarkAsRead?: (messageId: number) => void;
}

const MessageThread = ({
  messages,
  currentUserId,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  onEditMessage,
  onDeleteMessage,
  onMarkAsRead,
}: MessageThreadProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef<number>(0);
  const markedAsReadRef = useRef<Set<number>>(new Set());

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      const container = messagesContainerRef.current;
      if (container) {
        // Only auto-scroll if user is near the bottom (within 100px)
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 100;

        if (isNearBottom || messages.length === 1) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages]);

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
      className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-bg-col/20 to-transparent"
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
          key={message.id}
          message={message}
          currentUserId={currentUserId}
          onEdit={onEditMessage}
          onDelete={onDeleteMessage}
        />
      ))}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageThread;
