'use client';

import { ConversationWithDetails } from '@/api/conversations';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  activeConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
}

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) => {
  return (
    <div className="bg-card-col rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Conversations</h2>

      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-center text-text-col/60">No conversations yet</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1">
          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const displayName =
              conv.otherUser.firstName && conv.otherUser.lastName
                ? `${conv.otherUser.firstName} ${conv.otherUser.lastName}`
                : conv.otherUser.username;

            const lastMessageTime = conv.lastMessageAt
              ? formatDistanceToNow(new Date(conv.lastMessageAt), {
                  addSuffix: true,
                })
              : '';

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full p-3 rounded-md transition-colors text-left ${
                  isActive
                    ? 'bg-bg-col/30 border-l-4 border-accent-col'
                    : 'hover:bg-bg-col/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium truncate">{displayName}</p>
                  {conv.unreadCount > 0 && (
                    <div className="bg-accent-col text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-col/60 truncate flex-1">
                    {conv.lastMessage?.isDeleted
                      ? '[Message deleted]'
                      : conv.lastMessage?.content || 'No messages yet'}
                  </p>
                  {lastMessageTime && (
                    <p className="text-xs text-text-col/40 ml-2 flex-shrink-0">
                      {lastMessageTime}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
