'use client';

import { MessageWithSender } from '@/api/conversations';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: MessageWithSender;
  currentUserId: number;
}

const MessageBubble = ({ message, currentUserId }: MessageBubbleProps) => {
  const isSent = message.senderId === currentUserId;
  const isDeleted = message.isDeleted;

  // Format timestamp
  const timestamp = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={`flex gap-2 mb-3 ${isSent ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar (only for received messages) */}
      {!isSent && (
        <div className="flex-shrink-0 self-end mb-1">
          <div className="w-8 h-8 rounded-full bg-accent-col/20 flex items-center justify-center text-sm font-medium">
            {message.sender?.firstName?.[0] ||
              message.sender?.username?.[0] ||
              'U'}
          </div>
        </div>
      )}

      {/* Message content */}
      <div
        className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[80%]`}
      >
        {/* Sender name (only for received messages) */}
        {!isSent && (
          <div className="text-xs text-text-col/60 mb-1 px-3">
            {message.sender?.firstName && message.sender?.lastName
              ? `${message.sender.firstName} ${message.sender.lastName}`
              : message.sender?.username || 'Unknown'}
          </div>
        )}

        {/* Message content */}
        <div className="relative max-w-full flex flex-col gap-1">
          {/* Image if present - shown separately without bubble */}
          {message.imageUrl && !isDeleted && (
            <img
              src={message.imageUrl}
              alt="Message attachment"
              className="rounded-2xl max-w-[280px] max-h-[280px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
              style={{ aspectRatio: 'auto' }}
            />
          )}

          {/* Message text bubble */}
          {message.content && message.content.trim() && (
            <div
              className={`px-4 border-[0.5px] py-2.5 max-w-full ${
                isSent
                  ? 'bg-card-col border-accent-col rounded-2xl rounded-br-md'
                  : 'bg-card-col border-text-col/10 rounded-2xl rounded-bl-md'
              }`}
            >
              <p
                className={`text-sm break-words overflow-wrap-anywhere max-w-full ${isDeleted ? 'italic opacity-60' : ''}`}
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              >
                {message.content}
              </p>
            </div>
          )}
        </div>

        {/* Message metadata */}
        <div
          className={`flex items-center gap-2 text-[10px] text-text-col/40 mt-0.5 ${isSent ? 'px-3' : 'px-3'}`}
        >
          <span>{timestamp}</span>
          {message.isEdited && !isDeleted && <span>• Edited</span>}
          {isSent && message.isRead && <span>• Read</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
