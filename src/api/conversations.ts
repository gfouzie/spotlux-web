import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { authRequest } from './shared';

export interface Conversation {
  id: number;
  user1Id: number;
  user2Id: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface OtherUser {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

export interface LastMessage {
  id: number;
  content: string;
  senderId: number;
  imageUrl?: string | null;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface ConversationWithDetails extends Conversation {
  otherUser: OtherUser;
  lastMessage?: LastMessage | null;
  unreadCount: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  imageUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface SenderInfo {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

export interface MessageWithSender extends Message {
  sender: SenderInfo;
}

export const conversationsApi = {
  /**
   * Create or get existing conversation with a friend
   */
  async createOrGetConversation(friendId: number): Promise<Conversation> {
    const url = `${config.apiBaseUrl}/api/v1/conversations?friend_id=${friendId}`;
    return authRequest<Conversation>(url, {
      method: 'POST',
      cache: 'no-store',
    });
  },

  /**
   * Get all conversations for current user
   */
  async getConversations(offset = 0, limit = 20): Promise<ConversationWithDetails[]> {
    const params = buildQueryParams({
      offset,
      limit,
    });

    const url = `${config.apiBaseUrl}/api/v1/conversations?${params}`;
    return authRequest<ConversationWithDetails[]>(url, {
      cache: 'no-store',
    });
  },

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: number): Promise<Conversation> {
    const url = `${config.apiBaseUrl}/api/v1/conversations/${conversationId}`;
    return authRequest<Conversation>(url, {
      cache: 'no-store',
    });
  },

  /**
   * Get messages in a conversation
   */
  async getMessages(
    conversationId: number,
    offset = 0,
    limit = 50
  ): Promise<MessageWithSender[]> {
    const params = buildQueryParams({
      offset,
      limit,
    });

    const url = `${config.apiBaseUrl}/api/v1/conversations/${conversationId}/messages?${params}`;
    return authRequest<MessageWithSender[]>(url, {
      cache: 'no-store',
    });
  },

  /**
   * Search messages in a conversation
   */
  async searchMessages(
    conversationId: number,
    query: string,
    offset = 0,
    limit = 50
  ): Promise<MessageWithSender[]> {
    const params = buildQueryParams({
      query,
      offset,
      limit,
    });

    const url = `${config.apiBaseUrl}/api/v1/conversations/${conversationId}/search?${params}`;
    return authRequest<MessageWithSender[]>(url, {
      cache: 'no-store',
    });
  },
};
