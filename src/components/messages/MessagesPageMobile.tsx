'use client';

import { ConversationWithDetails, MessageWithSender } from '@/api/conversations';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import EmptyMessagesState from './EmptyMessagesState';
import NewConversationModal from './NewConversationModal';

interface MessagesPageMobileProps {
  conversations: ConversationWithDetails[];
  activeConversationId: number | null;
  messages: MessageWithSender[];
  currentUserId: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  isOtherUserTyping: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  showNewConversationModal: boolean;
  onSelectConversation: (conversationId: number) => void;
  onBackToList: () => void;
  onSendMessage: (content: string, imageUrl?: string | null) => void;
  onTypingChange: (isTyping: boolean) => void;
  onMarkAsRead: (messageId: number) => void;
  onLoadMoreMessages: () => void;
  onNewMessage: () => void;
  onCreateConversation: (friendId: number) => void;
  onCloseModal: () => void;
}

const MessagesPageMobile = ({
  conversations,
  activeConversationId,
  messages,
  currentUserId,
  isConnected,
  isLoading,
  error,
  isOtherUserTyping,
  hasMore,
  isLoadingMore,
  showNewConversationModal,
  onSelectConversation,
  onBackToList,
  onSendMessage,
  onTypingChange,
  onMarkAsRead,
  onLoadMoreMessages,
  onNewMessage,
  onCreateConversation,
  onCloseModal,
}: MessagesPageMobileProps) => {
  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  return (
    <div className="h-[calc(100dvh-8rem)] bg-bg-col text-text-col flex flex-col overflow-hidden">
      {error && (
        <div className="flex-shrink-0 m-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1">
          <EmptyMessagesState onNewMessage={onNewMessage} />
        </div>
      ) : activeConversationId ? (
        <div className="flex-1 overflow-hidden">
          <ConversationView
            conversation={activeConversation}
            messages={messages}
            currentUserId={currentUserId}
            isConnected={isConnected}
            isOtherUserTyping={isOtherUserTyping}
            onSendMessage={onSendMessage}
            onTypingChange={onTypingChange}
            onMarkAsRead={onMarkAsRead}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMoreMessages}
            onBackToList={onBackToList}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={onSelectConversation}
            onNewMessage={onNewMessage}
          />
        </div>
      )}

      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={onCloseModal}
        onSelectFriend={onCreateConversation}
      />
    </div>
  );
};

export default MessagesPageMobile;
