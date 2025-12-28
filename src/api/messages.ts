import { config } from '@/lib/config';
import { authRequest } from './client';
import { Message } from './conversations';

export interface SendMessageRequest {
  conversationId: number;
  content: string;
  imageUrl?: string | null;
}

export interface EditMessageRequest {
  content: string;
}

export const messagesApi = {
  /**
   * Send a message via REST API
   * (Note: Real-time sending should use WebSocket)
   */
  async sendMessage(request: SendMessageRequest): Promise<Message> {
    const url = `${config.apiBaseUrl}/api/v1/messages`;
    return authRequest<Message>(url, {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store',
    });
  },

  /**
   * Edit a message
   */
  async editMessage(
    messageId: number,
    request: EditMessageRequest
  ): Promise<Message> {
    const url = `${config.apiBaseUrl}/api/v1/messages/${messageId}`;
    return authRequest<Message>(url, {
      method: 'PATCH',
      body: JSON.stringify(request),
      cache: 'no-store',
    });
  },

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: number): Promise<Message> {
    const url = `${config.apiBaseUrl}/api/v1/messages/${messageId}`;
    return authRequest<Message>(url, {
      method: 'DELETE',
      cache: 'no-store',
    });
  },

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: number): Promise<Message> {
    const url = `${config.apiBaseUrl}/api/v1/messages/${messageId}/read`;
    return authRequest<Message>(url, {
      method: 'PATCH',
      cache: 'no-store',
    });
  },
};
