'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { wsClient, WebSocketEvent } from '@/lib/websocket';
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
  setActiveConversation: (conversationId: number | null) => void;
  sendMessage: (conversationId: number, content: string, imageUrl?: string | null) => void;
  editMessage: (conversationId: number, messageId: number, content: string) => void;
  deleteMessage: (conversationId: number, messageId: number) => void;
  markAsRead: (conversationId: number, messageId: number) => void;
  sendTyping: (conversationId: number, isTyping: boolean) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: number, offset?: number, limit?: number) => Promise<void>;
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
      };
    case 'ADD_MESSAGE': {
      const existing = state.messages[action.conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: [...existing, action.message],
        },
      };
    }
    case 'UPDATE_MESSAGE': {
      const convMessages = state.messages[action.conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: convMessages.map((msg) =>
            msg.id === action.messageId ? { ...msg, ...action.updates } : msg
          ),
        },
      };
    }
    case 'DELETE_MESSAGE': {
      const convMessages = state.messages[action.conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: convMessages.map((msg) =>
            msg.id === action.messageId
              ? { ...msg, isDeleted: true, content: '[Message deleted]' }
              : msg
          ),
        },
      };
    }
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.conversationId ? { ...conv, ...action.updates } : conv
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
    default:
      return state;
  }
};

// Create context
const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// Messaging provider component
export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(messagingReducer, initialState);
  const { isAuthenticated, accessToken } = useAuth();

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      // User logged out, disconnect
      wsClient.disconnect();
      dispatch({ type: 'SET_CONNECTED', connected: false });
      return;
    }

    // User is authenticated, connect
    wsClient.connect(accessToken);

    // Subscribe to connection status changes
    const unsubscribe = wsClient.onConnectionStatusChange((connected) => {
      dispatch({ type: 'SET_CONNECTED', connected });
    });

    // Cleanup: only unsubscribe, don't disconnect
    // The singleton WebSocket client should stay connected across component remounts
    // It will only disconnect when user logs out (handled above)
    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, accessToken]);

  // Subscribe to WebSocket events
  useEffect(() => {
    const handleWebSocketEvent = (event: WebSocketEvent) => {
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
          // Note: We'd need to find which conversation this message belongs to
          // For now, we'll handle this when we have more context
          break;

        case 'message.edited':
          // Update message content
          if (event.messageId && event.content) {
            // We'd need to find the conversation for this message
            // For simplicity, update all conversations
            Object.keys(state.messages).forEach((convId) => {
              dispatch({
                type: 'UPDATE_MESSAGE',
                conversationId: parseInt(convId),
                messageId: event.messageId,
                updates: {
                  content: event.content,
                  isEdited: true,
                  updatedAt: event.updatedAt,
                },
              });
            });
          }
          break;

        case 'message.deleted':
          // Mark message as deleted
          if (event.messageId) {
            Object.keys(state.messages).forEach((convId) => {
              dispatch({
                type: 'DELETE_MESSAGE',
                conversationId: parseInt(convId),
                messageId: event.messageId,
              });
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
    };

    const unsubscribe = wsClient.subscribe(handleWebSocketEvent);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - event handler uses dispatch which is stable

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
        error: error instanceof Error ? error.message : 'Failed to load conversations',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(
    async (conversationId: number, offset = 0, limit = 50) => {
      try {
        const messages = await conversationsApi.getMessages(conversationId, offset, limit);
        dispatch({
          type: 'SET_MESSAGES',
          conversationId,
          messages: messages.reverse(), // Reverse to show oldest first
        });
      } catch (error) {
        console.error('[Messaging] Failed to load messages:', error);
        dispatch({
          type: 'SET_ERROR',
          error: error instanceof Error ? error.message : 'Failed to load messages',
        });
      }
    },
    []
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
  const editMessage = useCallback((_conversationId: number, messageId: number, content: string) => {
    wsClient.send({
      type: 'message.edit',
      messageId,
      content,
    });
  }, []);

  // Delete message via WebSocket
  const deleteMessage = useCallback((_conversationId: number, messageId: number) => {
    wsClient.send({
      type: 'message.delete',
      messageId,
    });
  }, []);

  // Mark message as read via WebSocket
  const markAsRead = useCallback((_conversationId: number, messageId: number) => {
    wsClient.send({
      type: 'message.read',
      messageId,
    });
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((conversationId: number, isTyping: boolean) => {
    wsClient.send({
      type: isTyping ? 'typing.start' : 'typing.stop',
      conversationId,
    });
  }, []);

  // Create or get conversation with a friend
  const createOrGetConversation = useCallback(async (friendId: number): Promise<number | null> => {
    try {
      const conversation = await conversationsApi.createOrGetConversation(friendId);
      // Reload conversations to get the new/existing one with full details
      await loadConversations();
      return conversation.id;
    } catch (error) {
      console.error('[Messaging] Failed to create/get conversation:', error);
      dispatch({
        type: 'SET_ERROR',
        error: error instanceof Error ? error.message : 'Failed to create conversation',
      });
      return null;
    }
  }, [loadConversations]);

  const value: MessagingContextType = {
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    messages: state.messages,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,
    typingUsers: state.typingUsers,
    setActiveConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    sendTyping,
    loadConversations,
    loadMessages,
    createOrGetConversation,
  };

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
};

// Hook to use messaging context
export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
