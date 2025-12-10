'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMessaging } from '@/contexts/MessagingContext';
import { useUser } from '@/contexts/UserContext';
import MessagesHeader from './MessagesHeader';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import EmptyMessagesState from './EmptyMessagesState';
import NewConversationModal from './NewConversationModal';

const MessagesPage = () => {
  const {
    conversations,
    activeConversationId,
    messages,
    isConnected,
    isLoading,
    error,
    typingUsers,
    loadConversations,
    loadMessages,
    setActiveConversation,
    sendMessage,
    sendTyping,
    markAsRead,
    createOrGetConversation,
  } = useMessaging();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [showNewConversationModal, setShowNewConversationModal] =
    useState(false);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Auto-select conversation from query parameter
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam) {
      const conversationId = parseInt(conversationParam);
      if (!isNaN(conversationId) && conversations.length > 0) {
        setActiveConversation(conversationId);
        loadMessages(conversationId);
      }
    }
  }, [searchParams, conversations, setActiveConversation, loadMessages]);

  const handleSelectConversation = (conversationId: number) => {
    setActiveConversation(conversationId);
    loadMessages(conversationId);
  };

  const handleSendMessage = (content: string, imageUrl?: string | null) => {
    if (!activeConversationId) return;
    sendMessage(activeConversationId, content, imageUrl);
  };

  const handleTypingChange = (isTyping: boolean) => {
    if (!activeConversationId) return;
    sendTyping(activeConversationId, isTyping);
  };

  const handleMarkAsRead = (messageId: number) => {
    if (!activeConversationId) return;
    markAsRead(activeConversationId, messageId);
  };

  const handleCreateConversation = async (friendId: number) => {
    const conversationId = await createOrGetConversation(friendId);
    if (conversationId) {
      setActiveConversation(conversationId);
      loadMessages(conversationId);
    }
    setShowNewConversationModal(false);
  };

  const handleNewMessage = () => {
    setShowNewConversationModal(true);
  };

  const activeMessages = activeConversationId
    ? messages[activeConversationId] || []
    : [];

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  const isOtherUserTyping =
    activeConversationId &&
    typingUsers[activeConversationId] &&
    typingUsers[activeConversationId].size > 0;

  return (
    <div className="h-screen bg-bg-col text-text-col flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full p-8">
        <MessagesHeader />

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-500">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex-1">
            <EmptyMessagesState onNewMessage={handleNewMessage} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
            <div className="lg:col-span-1 overflow-hidden">
              <ConversationList
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewMessage={handleNewMessage}
              />
            </div>

            <div className="lg:col-span-2 overflow-hidden">
              <ConversationView
                conversation={activeConversation}
                messages={activeMessages}
                currentUserId={user?.id || 0}
                isConnected={isConnected}
                isOtherUserTyping={!!isOtherUserTyping}
                onSendMessage={handleSendMessage}
                onTypingChange={handleTypingChange}
                onMarkAsRead={handleMarkAsRead}
              />
            </div>
          </div>
        )}

        <NewConversationModal
          isOpen={showNewConversationModal}
          onClose={() => setShowNewConversationModal(false)}
          onSelectFriend={handleCreateConversation}
        />
      </div>
    </div>
  );
};

export default MessagesPage;
