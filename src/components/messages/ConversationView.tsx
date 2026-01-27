'use client';

import { useState } from 'react';
import {
  ConversationWithDetails,
  MessageWithSender,
} from '@/api/conversations';
import ConversationHeader from './ConversationHeader';
import MessageThread from './MessageThread';
import MessageInput from './MessageInput';
import CreateFriendMatchupModal from './CreateFriendMatchupModal';

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
  onMessagesRefresh?: () => void;
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
  onMessagesRefresh,
}: ConversationViewProps) => {
  const [showChallengeModal, setShowChallengeModal] = useState(false);

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

  const handleChallengeCreated = () => {
    setShowChallengeModal(false);
    onMessagesRefresh?.();
  };

  return (
    <div className="bg-card-col flex flex-col h-full overflow-hidden">
      <ConversationHeader
        conversation={conversation}
        onBackToList={onBackToList}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onMarkAsRead={onMarkAsRead}
          isOtherUserTyping={isOtherUserTyping}
          onMatchupUpdated={onMessagesRefresh}
        />
      </div>

      <MessageInput
        onSendMessage={onSendMessage}
        onTypingChange={onTypingChange}
        disabled={!isConnected}
        onChallengeClick={() => setShowChallengeModal(true)}
      />

      <CreateFriendMatchupModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        conversationId={conversation.id}
        responderId={conversation.otherUser.id}
        responderUsername={conversation.otherUser.username}
        onCreated={handleChallengeCreated}
      />
    </div>
  );
};

export default ConversationView;
