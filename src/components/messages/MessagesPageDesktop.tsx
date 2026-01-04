'use client';

import { ConversationWithDetails, MessageWithSender } from '@/api/conversations';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import NewConversationModal from './NewConversationModal';

interface MessagesPageDesktopProps {
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
  onSendMessage: (content: string, imageUrl?: string | null) => void;
  onTypingChange: (isTyping: boolean) => void;
  onMarkAsRead: (messageId: number) => void;
  onLoadMoreMessages: () => void;
  onNewMessage: () => void;
  onCreateConversation: (friendId: number) => void;
  onCloseModal: () => void;
}

const MessagesPageDesktop = ({
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
  onSendMessage,
  onTypingChange,
  onMarkAsRead,
  onLoadMoreMessages,
  onNewMessage,
  onCreateConversation,
  onCloseModal,
}: MessagesPageDesktopProps) => {
  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  return (
    <div className="h-screen bg-bg-col text-text-col flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full p-8">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-500">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
            <div className="col-span-1 overflow-hidden rounded-lg">
              <ConversationList
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={onSelectConversation}
                onNewMessage={onNewMessage}
              />
            </div>

            <div className="col-span-2 overflow-hidden rounded-lg">
              {activeConversation ? (
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
                />
              ) : (
                <div className="bg-card-col h-full flex items-center justify-center">
                  <p className="text-text-col/60">
                    {conversations.length === 0
                      ? 'No conversations yet. Start messaging your friends!'
                      : 'Select a conversation to view messages'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <NewConversationModal
          isOpen={showNewConversationModal}
          onClose={onCloseModal}
          onSelectFriend={onCreateConversation}
        />
      </div>
    </div>
  );
};

export default MessagesPageDesktop;
