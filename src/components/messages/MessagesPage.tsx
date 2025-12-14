'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMessaging } from '@/contexts/MessagingContext';
import { useUser } from '@/contexts/UserContext';
import MessagesPageMobile from './MessagesPageMobile';
import MessagesPageDesktop from './MessagesPageDesktop';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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

  const handleBackToList = () => {
    setActiveConversation(null);
    // Clear conversation from URL on mobile
    const params = new URLSearchParams(searchParams.toString());
    params.delete('conversation');
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

  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const sharedProps = {
    conversations,
    activeConversationId,
    messages: activeMessages,
    currentUserId: user?.id || 0,
    isConnected,
    isLoading,
    error,
    isOtherUserTyping: !!isOtherUserTyping,
    hasMore: activePagination?.hasMore || false,
    isLoadingMore: activePagination?.isLoadingMore || false,
    showNewConversationModal,
    onSelectConversation: handleSelectConversation,
    onSendMessage: handleSendMessage,
    onTypingChange: handleTypingChange,
    onMarkAsRead: handleMarkAsRead,
    onLoadMoreMessages: handleLoadMoreMessages,
    onNewMessage: handleNewMessage,
    onCreateConversation: handleCreateConversation,
    onCloseModal: () => setShowNewConversationModal(false),
  };

  if (isDesktop) {
    return <MessagesPageDesktop {...sharedProps} />;
  }

  return <MessagesPageMobile {...sharedProps} onBackToList={handleBackToList} />;
};

export default MessagesPage;
