'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { wsClient, WebSocketEvent } from '@/lib/websocket';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  conversationsApi,
  ConversationWithDetails,
  MessageWithSender,
} from '@/api/conversations';

// Messaging state interface
interface MessagingState {
  conversations: ConversationWithDetails[];
  activeConversationId: number | null;
  messages: Record<number, MessageWithSender[]>; // conversationId -> messages
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  typingUsers: Record<number, Set<number>>; // conversationId -> Set of user IDs typing
  pagination: Record<
    number,
    { hasMore: boolean; isLoadingMore: boolean; offset: number }
  >; // conversationId -> pagination state
}

// Messaging actions
type MessagingAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_CONNECTED'; connected: boolean }
  | { type: 'SET_CONVERSATIONS'; conversations: ConversationWithDetails[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; conversationId: number | null }
  | {
      type: 'SET_MESSAGES';
      conversationId: number;
      messages: MessageWithSender[];
      hasMore: boolean;
    }
  | {
      type: 'PREPEND_MESSAGES';
      conversationId: number;
      messages: MessageWithSender[];
      hasMore: boolean;
    }
  | {
      type: 'ADD_MESSAGE';
      conversationId: number;
      message: MessageWithSender;
    }
  | {
      type: 'UPDATE_MESSAGE';
      conversationId: number;
      messageId: number;
      updates: Partial<MessageWithSender>;
    }
  | {
      type: 'DELETE_MESSAGE';
      conversationId: number;
      messageId: number;
    }
  | {
      type: 'UPDATE_CONVERSATION';
      conversationId: number;
      updates: Partial<ConversationWithDetails>;
    }
  | {
      type: 'SET_TYPING';
      conversationId: number;
      userId: number;
      isTyping: boolean;
    }
  | {
      type: 'SET_LOADING_MORE';
      conversationId: number;
      isLoadingMore: boolean;
    };

// Messaging context interface
interface MessagingContextType {
  conversations: ConversationWithDetails[];
  activeConversationId: number | null;
  messages: Record<number, MessageWithSender[]>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  typingUsers: Record<number, Set<number>>;
  pagination: Record<
    number,
    { hasMore: boolean; isLoadingMore: boolean; offset: number }
  >;
  setActiveConversation: (conversationId: number | null) => void;
  sendMessage: (
    conversationId: number,
    content: string,
    imageUrl?: string | null
  ) => void;
  editMessage: (
    conversationId: number,
    messageId: number,
    content: string
  ) => void;
  deleteMessage: (conversationId: number, messageId: number) => void;
  markAsRead: (conversationId: number, messageId: number) => void;
  sendTyping: (conversationId: number, isTyping: boolean) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (
    conversationId: number,
    offset?: number,
    limit?: number
  ) => Promise<void>;
  loadMoreMessages: (conversationId: number) => Promise<void>;
  createOrGetConversation: (friendId: number) => Promise<number | null>;
}

// Initial state
const initialState: MessagingState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  isConnected: false,
  isLoading: false,
  error: null,
  typingUsers: {},
  pagination: {},
};

// Messaging reducer
const messagingReducer = (
  state: MessagingState,
  action: MessagingAction
): MessagingState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.connected };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.conversations };
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.conversationId };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: action.messages,
        },
        pagination: {
          ...state.pagination,
          [action.conversationId]: {
            hasMore: action.hasMore,
            isLoadingMore: false,
            offset: action.messages.length,
          },
        },
      };
    case 'PREPEND_MESSAGES': {
      const existing = state.messages[action.conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: [...action.messages, ...existing],
        },
        pagination: {
          ...state.pagination,
          [action.conversationId]: {
            hasMore: action.hasMore,
            isLoadingMore: false,
            offset:
              (state.pagination[action.conversationId]?.offset || 0) +
              action.messages.length,
          },
        },
      };
    }
    case 'ADD_MESSAGE': {
      const existing = state.messages[action.conversationId] || [];

      // Update the conversation's lastMessage and lastMessageAt
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === action.conversationId) {
          return {
            ...conv,
            lastMessage: action.message,
            lastMessageAt: action.message.createdAt,
          };
        }
        return conv;
      });

      // Sort conversations by lastMessageAt (most recent first)
      const sortedConversations = [...updatedConversations].sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });

      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: [...existing, action.message],
        },
        conversations: sortedConversations,
      };
    }
    case 'UPDATE_MESSAGE': {
      const convMessages = state.messages[action.conversationId] || [];
      const updatedMessages = convMessages.map((msg) =>
        msg.id === action.messageId ? { ...msg, ...action.updates } : msg
      );

      // Update conversations based on what changed
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id !== action.conversationId) {
          return conv;
        }

        const updates: Partial<ConversationWithDetails> = {};

        // If a message was marked as read, decrement the unread count
        if (action.updates.isRead === true && conv.unreadCount > 0) {
          updates.unreadCount = conv.unreadCount - 1;
        }

        // If this was the last message and it was edited, update lastMessage
        if (
          conv.lastMessage?.id === action.messageId &&
          action.updates.content !== undefined
        ) {
          updates.lastMessage = {
            ...conv.lastMessage,
            ...action.updates,
          };
        }

        return Object.keys(updates).length > 0 ? { ...conv, ...updates } : conv;
      });

      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: updatedMessages,
        },
        conversations: updatedConversations,
      };
    }
    case 'DELETE_MESSAGE': {
      const convMessages = state.messages[action.conversationId] || [];
      const updatedMessages = convMessages.map((msg) =>
        msg.id === action.messageId
          ? { ...msg, isDeleted: true, content: '[Message deleted]' }
          : msg
      );

      // Update the conversation's lastMessage if this was the most recent message
      const updatedConversations = state.conversations.map((conv) => {
        if (
          conv.id === action.conversationId &&
          conv.lastMessage?.id === action.messageId
        ) {
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              isDeleted: true,
              content: '[Message deleted]',
            },
          };
        }
        return conv;
      });

      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: updatedMessages,
        },
        conversations: updatedConversations,
      };
    }
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.conversationId
            ? { ...conv, ...action.updates }
            : conv
        ),
      };
    case 'SET_TYPING': {
      const typingSet = new Set(state.typingUsers[action.conversationId] || []);
      if (action.isTyping) {
        typingSet.add(action.userId);
      } else {
        typingSet.delete(action.userId);
      }
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.conversationId]: typingSet,
        },
      };
    }
    case 'SET_LOADING_MORE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          [action.conversationId]: {
            ...state.pagination[action.conversationId],
            hasMore: state.pagination[action.conversationId]?.hasMore ?? false,
            offset: state.pagination[action.conversationId]?.offset ?? 0,
            isLoadingMore: action.isLoadingMore,
          },
        },
      };
    default:
      return state;
  }
};

// Create context
const MessagingContext = createContext<MessagingContextType | undefined>(
  undefined
);

// Messaging provider component
export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(messagingReducer, initialState);
  const { isAuthenticated, accessToken } = useAuth();

  // Keep a ref to the current state to avoid stale closures
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // WebSocket event handler (stable reference via useCallback)
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    switch (event.type) {
      case 'message.new':
      case 'message.sent':
        // Add message to conversation
        if (event.message) {
          dispatch({
            type: 'ADD_MESSAGE',
            conversationId: event.message.conversationId,
            message: event.message,
          });
        }
        break;

      case 'message.read':
        // Update message read status
        if (event.messageId && event.conversationId) {
          dispatch({
            type: 'UPDATE_MESSAGE',
            conversationId: event.conversationId,
            messageId: event.messageId,
            updates: {
              isRead: true,
              readAt: event.readAt || new Date().toISOString(),
            },
          });
        }
        break;

      case 'message.edited':
        // Update message content - search through all loaded conversations using current state
        if (event.messageId && event.content) {
          // Use stateRef to get current messages without causing re-subscription
          const conversationIds = Object.keys(stateRef.current.messages).map(Number);
          conversationIds.forEach((convId) => {
            const messages = stateRef.current.messages[convId] || [];
            const messageExists = messages.some((msg) => msg.id === event.messageId);
            if (messageExists) {
              dispatch({
                type: 'UPDATE_MESSAGE',
                conversationId: convId,
                messageId: event.messageId,
                updates: {
                  content: event.content,
                  isEdited: true,
                  updatedAt: event.updatedAt,
                },
              });
            }
          });
        }
        break;

      case 'message.deleted':
        // Mark message as deleted
        if (event.messageId) {
          // Use stateRef to get current messages without causing re-subscription
          const conversationIds = Object.keys(stateRef.current.messages).map(Number);
          conversationIds.forEach((convId) => {
            const messages = stateRef.current.messages[convId] || [];
            const messageExists = messages.some((msg) => msg.id === event.messageId);
            if (messageExists) {
              dispatch({
                type: 'DELETE_MESSAGE',
                conversationId: convId,
                messageId: event.messageId,
              });
            }
          });
        }
        break;

      case 'typing.start':
        if (event.conversationId && event.userId) {
          dispatch({
            type: 'SET_TYPING',
            conversationId: event.conversationId,
            userId: event.userId,
            isTyping: true,
          });
        }
        break;

      case 'typing.stop':
        if (event.conversationId && event.userId) {
          dispatch({
            type: 'SET_TYPING',
            conversationId: event.conversationId,
            userId: event.userId,
            isTyping: false,
          });
        }
        break;

      case 'error':
        console.error('[Messaging] WebSocket error:', event.message);
        dispatch({ type: 'SET_ERROR', error: event.message });
        break;
    }
  }, []); // dispatch is stable, stateRef is used for current state

  // Use the new useWebSocket hook to manage connection and subscription
  // This fixes the race condition by ensuring subscription happens before connection
  const isConnected = useWebSocket(
    isAuthenticated && accessToken ? accessToken : null,
    handleWebSocketEvent
  );

  // Update connection state when it changes
  useEffect(() => {
    dispatch({ type: 'SET_CONNECTED', connected: isConnected });
  }, [isConnected]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      const conversations = await conversationsApi.getConversations();
      dispatch({ type: 'SET_CONVERSATIONS', conversations });
    } catch (error) {
      console.error('[Messaging] Failed to load conversations:', error);
      dispatch({
        type: 'SET_ERROR',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load conversations',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []);

  // Load messages for a conversation (initial load)
  const loadMessages = useCallback(
    async (conversationId: number, offset = 0, limit = 50) => {
      try {
        const messages = await conversationsApi.getMessages(
          conversationId,
          offset,
          limit
        );
        const reversedMessages = messages.reverse(); // Reverse to show oldest first
        dispatch({
          type: 'SET_MESSAGES',
          conversationId,
          messages: reversedMessages,
          hasMore: messages.length === limit, // If we got a full page, there might be more
        });
      } catch (error) {
        console.error('[Messaging] Failed to load messages:', error);
        dispatch({
          type: 'SET_ERROR',
          error:
            error instanceof Error ? error.message : 'Failed to load messages',
        });
      }
    },
    []
  );

  // Load more messages for a conversation (pagination)
  const loadMoreMessages = useCallback(
    async (conversationId: number) => {
      const paginationState = state.pagination[conversationId];
      if (!paginationState?.hasMore || paginationState.isLoadingMore) {
        return;
      }

      try {
        dispatch({
          type: 'SET_LOADING_MORE',
          conversationId,
          isLoadingMore: true,
        });

        const limit = 50;
        const offset = paginationState.offset;
        const messages = await conversationsApi.getMessages(
          conversationId,
          offset,
          limit
        );
        const reversedMessages = messages.reverse(); // Reverse to show oldest first

        dispatch({
          type: 'PREPEND_MESSAGES',
          conversationId,
          messages: reversedMessages,
          hasMore: messages.length === limit, // If we got a full page, there might be more
        });
      } catch (error) {
        console.error('[Messaging] Failed to load more messages:', error);
        dispatch({
          type: 'SET_ERROR',
          error:
            error instanceof Error
              ? error.message
              : 'Failed to load more messages',
        });
        dispatch({
          type: 'SET_LOADING_MORE',
          conversationId,
          isLoadingMore: false,
        });
      }
    },
    [state.pagination]
  );

  // Set active conversation
  const setActiveConversation = useCallback((conversationId: number | null) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', conversationId });
  }, []);

  // Send message via WebSocket
  const sendMessage = useCallback(
    (conversationId: number, content: string, imageUrl?: string | null) => {
      wsClient.send({
        type: 'message.send',
        conversationId,
        content,
        imageUrl,
      });
    },
    []
  );

  // Edit message via WebSocket
  const editMessage = useCallback(
    (_conversationId: number, messageId: number, content: string) => {
      wsClient.send({
        type: 'message.edit',
        messageId,
        content,
      });
    },
    []
  );

  // Delete message via WebSocket
  const deleteMessage = useCallback(
    (_conversationId: number, messageId: number) => {
      wsClient.send({
        type: 'message.delete',
        messageId,
      });
    },
    []
  );

  // Mark message as read via WebSocket
  const markAsRead = useCallback(
    (conversationId: number, messageId: number) => {
      // Optimistically update local state immediately
      dispatch({
        type: 'UPDATE_MESSAGE',
        conversationId,
        messageId,
        updates: {
          isRead: true,
          readAt: new Date().toISOString(),
        },
      });

      // Send to server via WebSocket
      wsClient.send({
        type: 'message.read',
        messageId,
      });
    },
    []
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (conversationId: number, isTyping: boolean) => {
      wsClient.send({
        type: isTyping ? 'typing.start' : 'typing.stop',
        conversationId,
      });
    },
    []
  );

  // Create or get conversation with a friend
  const createOrGetConversation = useCallback(
    async (friendId: number): Promise<number | null> => {
      try {
        const conversation =
          await conversationsApi.createOrGetConversation(friendId);
        // Reload conversations to get the new/existing one with full details
        await loadConversations();
        return conversation.id;
      } catch (error) {
        console.error('[Messaging] Failed to create/get conversation:', error);
        dispatch({
          type: 'SET_ERROR',
          error:
            error instanceof Error
              ? error.message
              : 'Failed to create conversation',
        });
        return null;
      }
    },
    [loadConversations]
  );

  const value: MessagingContextType = {
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    messages: state.messages,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,
    typingUsers: state.typingUsers,
    pagination: state.pagination,
    setActiveConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    sendTyping,
    loadConversations,
    loadMessages,
    loadMoreMessages,
    createOrGetConversation,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

// Hook to use messaging context
export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
