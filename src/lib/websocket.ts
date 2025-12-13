import { config } from './config';
import { keysToCamel, keysToSnake } from './caseConversion';

export type WebSocketEvent =
  | { type: 'message.sent'; message: any }
  | { type: 'message.new'; message: any }
  | {
      type: 'message.read';
      messageId: number;
      conversationId: number;
      readAt: string;
    }
  | {
      type: 'message.edited';
      messageId: number;
      content: string;
      updatedAt: string;
    }
  | { type: 'message.deleted'; messageId: number; deletedAt: string }
  | { type: 'typing.start'; userId: number; conversationId: number }
  | { type: 'typing.stop'; userId: number; conversationId: number }
  | { type: 'error'; message: string };

export type WebSocketEventHandler = (event: WebSocketEvent) => void;
export type ConnectionStatusHandler = (connected: boolean) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start at 1 second
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private eventHandlers: Set<WebSocketEventHandler> = new Set();
  private connectionStatusHandlers: Set<ConnectionStatusHandler> = new Set();
  private messageQueue: any[] = [];
  private isConnected = false;
  private shouldReconnect = true;

  /**
   * Connect to WebSocket server
   * @param token - JWT access token for authentication
   */
  connect(token: string): void {
    // If already connected or connecting with the same token, do nothing
    if (this.ws && this.token === token) {
      const state = this.ws.readyState;
      if (state === WebSocket.CONNECTING || state === WebSocket.OPEN) {
        return;
      }
    }

    // Close existing connection if in a bad state
    if (this.ws) {
      const state = this.ws.readyState;
      if (state === WebSocket.OPEN || state === WebSocket.CLOSING) {
        this.ws.close();
      }
      this.ws = null;
    }

    // Clear any pending reconnection attempts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.token = token;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0; // Reset reconnect attempts
    this.createConnection();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  /**
   * Send an event to the server
   * @param event - Event data to send
   */
  send(event: any): void {
    // Convert camelCase to snake_case for backend
    const snakeCaseEvent = keysToSnake(event);

    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(snakeCaseEvent));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(event);
    }
  }

  /**
   * Subscribe to WebSocket events
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  subscribe(handler: WebSocketEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to connection status changes
   * @param handler - Connection status handler function
   * @returns Unsubscribe function
   */
  onConnectionStatusChange(handler: ConnectionStatusHandler): () => void {
    this.connectionStatusHandlers.add(handler);
    // Immediately call with current status
    handler(this.isConnected);
    return () => {
      this.connectionStatusHandlers.delete(handler);
    };
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Notify connection status handlers
   */
  private notifyConnectionStatusChange(connected: boolean): void {
    this.connectionStatusHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error('[WebSocket] Error in connection status handler:', error);
      }
    });
  }

  /**
   * Create WebSocket connection
   */
  private createConnection(): void {
    if (!this.token) {
      console.error('[WebSocket] No token provided');
      return;
    }

    // Convert HTTP URL to WebSocket URL
    const wsUrl = config.apiBaseUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');

    const url = `${wsUrl}/api/v1/ws/messages?token=${this.token}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        // Notify connection status change
        this.notifyConnectionStatusChange(true);

        // Send queued messages
        while (this.messageQueue.length > 0) {
          const event = this.messageQueue.shift();
          this.send(event);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);

          // Convert snake_case keys from backend to camelCase for frontend
          const data = keysToCamel(rawData);

          // Notify all subscribers
          this.eventHandlers.forEach((handler) => {
            try {
              handler(data);
            } catch (error) {
              console.error('[WebSocket] Error in event handler:', error);
            }
          });
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error, event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.ws = null;

        // Notify connection status change
        this.notifyConnectionStatusChange(false);

        // Attempt to reconnect with exponential backoff
        if (
          this.shouldReconnect &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnectAttempts++;
          const delay =
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

          console.log(
            `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
          );

          this.reconnectTimeout = setTimeout(() => {
            this.createConnection();
          }, delay);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('[WebSocket] Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
    }
  }
}

// Global WebSocket client instance
export const wsClient = new WebSocketClient();
