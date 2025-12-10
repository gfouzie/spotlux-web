'use client';

import { ConversationWithDetails } from '@/api/conversations';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListItemProps {
  conversation: ConversationWithDetails;
  isActive: boolean;
  onSelect: (conversationId: number) => void;
}

const ConversationListItem = ({
  conversation,
  isActive,
  onSelect,
}: ConversationListItemProps) => {
  const displayName =
    conversation.otherUser.firstName && conversation.otherUser.lastName
      ? `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
      : conversation.otherUser.username;

  const lastMessageTime = conversation.lastMessageAt
    ? formatDistanceToNow(new Date(conversation.lastMessageAt), {
        addSuffix: true,
      })
    : '';

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full p-3 rounded-md transition-colors text-left cursor-pointer ${
        isActive
          ? 'bg-bg-col/30 border-l-4 border-accent-col'
          : 'hover:bg-bg-col/50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-medium truncate">{displayName}</p>
        {conversation.unreadCount > 0 && (
          <div className="bg-accent-col text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
            {conversation.unreadCount}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-col/60 truncate flex-1">
          {conversation.lastMessage?.isDeleted
            ? '[Message deleted]'
            : conversation.lastMessage?.content || 'No messages yet'}
        </p>
        {lastMessageTime && (
          <p className="text-xs text-text-col/40 ml-2 flex-shrink-0">
            {lastMessageTime}
          </p>
        )}
      </div>
    </button>
  );
};

export default ConversationListItem;
