'use client';

import {
  ConversationWithDetails,
  MessageWithSender,
} from '@/api/conversations';
import ConversationHeader from './ConversationHeader';
import MessageThread from './MessageThread';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface ConversationViewProps {
  conversation: ConversationWithDetails | undefined;
  messages: MessageWithSender[];
  currentUserId: number;
  isConnected: boolean;
  isOtherUserTyping: boolean;
  onSendMessage: (content: string, imageUrl?: string | null) => void;
  onTypingChange: (isTyping: boolean) => void;
  onMarkAsRead: (messageId: number) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onBackToList?: () => void;
}

const ConversationView = ({
  conversation,
  messages,
  currentUserId,
  isConnected,
  isOtherUserTyping,
  onSendMessage,
  onTypingChange,
  onMarkAsRead,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onBackToList,
}: ConversationViewProps) => {
  if (!conversation) {
    return (
      <div className="bg-card-col flex items-center justify-center h-full">
        <div className="text-center text-text-col/60">
          <p className="text-lg mb-2">Select a conversation</p>
          <p className="text-sm">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const displayName =
    conversation.otherUser.firstName && conversation.otherUser.lastName
      ? `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
      : conversation.otherUser.username;

  return (
    <div className="bg-card-col flex flex-col h-full overflow-hidden">
      <ConversationHeader conversation={conversation} onBackToList={onBackToList} />

      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onMarkAsRead={onMarkAsRead}
        />
      </div>

      {isOtherUserTyping && <TypingIndicator username={displayName} />}

      <MessageInput
        onSendMessage={onSendMessage}
        onTypingChange={onTypingChange}
        disabled={!isConnected}
      />
    </div>
  );
};

export default ConversationView;
