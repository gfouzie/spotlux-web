import { useEffect, useCallback, useRef } from 'react';
import { wsClient, WebSocketEvent } from '@/lib/websocket';

/**
 * Hook to manage WebSocket connection and event subscriptions
 *
 * IMPORTANT: This hook ensures the subscription happens BEFORE the connection
 * opens to avoid race conditions where messages arrive before handlers are registered.
 *
 * @param token - JWT access token for authentication (null when not authenticated)
 * @param onEvent - Callback function to handle WebSocket events
 * @returns Connection status (true if connected, false otherwise)
 */
export function useWebSocket(
  token: string | null,
  onEvent: (event: WebSocketEvent) => void
) {
  // Use a ref to keep track of the latest onEvent callback without causing re-subscriptions
  const onEventRef = useRef(onEvent);

  // Update the ref whenever onEvent changes
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // Stable callback that uses the ref
  const stableOnEvent = useCallback((event: WebSocketEvent) => {
    onEventRef.current(event);
  }, []);

  useEffect(() => {
    if (!token) {
      // User logged out, disconnect
      wsClient.disconnect();
      return;
    }

    // CRITICAL: Subscribe FIRST, before connecting
    // This ensures handlers are registered before any messages arrive
    const unsubscribe = wsClient.subscribe(stableOnEvent);

    // Now connect - messages will be queued until connection opens
    wsClient.connect(token);

    // Cleanup: only unsubscribe, don't disconnect
    // The singleton WebSocket client should stay connected across component remounts
    return () => {
      unsubscribe();
      // Don't disconnect here - let the token change trigger disconnect
    };
  }, [token, stableOnEvent]);

  return wsClient.getConnectionStatus();
}
