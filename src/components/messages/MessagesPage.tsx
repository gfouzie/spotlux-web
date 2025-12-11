'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
    pagination,
    loadConversations,
    loadMessages,
    loadMoreMessages,
    setActiveConversation,
    sendMessage,
    sendTyping,
    markAsRead,
    createOrGetConversation,
  } = useMessaging();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showNewConversationModal, setShowNewConversationModal] =
    useState(false);
  const hasProcessedUrlParam = useRef(false);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Auto-select conversation from query parameter on initial load, or default to first conversation
  useEffect(() => {
    if (conversations.length === 0 || hasProcessedUrlParam.current) {
      return;
    }

    const conversationParam = searchParams.get('conversation');

    if (conversationParam) {
      // Try to open conversation from URL parameter
      const conversationId = parseInt(conversationParam);
      if (!isNaN(conversationId)) {
        const conversationExists = conversations.some(
          (conv) => conv.id === conversationId
        );
        if (conversationExists) {
          setActiveConversation(conversationId);
          loadMessages(conversationId);
          hasProcessedUrlParam.current = true;
          return;
        }
      }
    }

    // No URL parameter or conversation not found - default to first conversation
    const firstConversation = conversations[0];
    if (firstConversation) {
      setActiveConversation(firstConversation.id);
      loadMessages(firstConversation.id);

      // Update URL to reflect the selected conversation
      const params = new URLSearchParams(searchParams.toString());
      params.set('conversation', firstConversation.id.toString());
      router.push(`/messages?${params.toString()}`, { scroll: false });

      hasProcessedUrlParam.current = true;
    }
  }, [
    conversations,
    searchParams,
    setActiveConversation,
    loadMessages,
    router,
  ]);

  const handleSelectConversation = (conversationId: number) => {
    setActiveConversation(conversationId);
    loadMessages(conversationId);

    // Update URL to persist conversation across refreshes
    const params = new URLSearchParams(searchParams.toString());
    params.set('conversation', conversationId.toString());
    router.push(`/messages?${params.toString()}`, { scroll: false });
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

      // Update URL to persist conversation across refreshes
      const params = new URLSearchParams(searchParams.toString());
      params.set('conversation', conversationId.toString());
      router.push(`/messages?${params.toString()}`, { scroll: false });
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

  const activePagination = activeConversationId
    ? pagination[activeConversationId]
    : undefined;

  const handleLoadMoreMessages = () => {
    if (activeConversationId) {
      loadMoreMessages(activeConversationId);
    }
  };

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
                hasMore={activePagination?.hasMore || false}
                isLoadingMore={activePagination?.isLoadingMore || false}
                onLoadMore={handleLoadMoreMessages}
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
