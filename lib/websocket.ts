import type { Message } from "@/types";
import { config } from "@/lib/config";

type WebSocketCallback = (message: Message) => void;
type ConnectionCallback = (connected: boolean) => void;

class ChatWebSocket {
  private socket: WebSocket | null = null;
  private conversationId: string | null = null;
  private messageCallbacks: Set<WebSocketCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = config.limits.maxReconnectAttempts;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  connect(conversationId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN && this.conversationId === conversationId) {
      return;
    }

    this.disconnect();
    this.conversationId = conversationId;

    const wsUrl = config.wsUrl ||
      (typeof window !== "undefined" ? `ws://${window.location.host}` : "ws://localhost:8080");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const url = `${wsUrl}/ws/chat/${conversationId}${token ? `?token=${token}` : ""}`;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.notifyConnectionCallbacks(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data);
          this.notifyMessageCallbacks(message);
        } catch {
          // Invalid message format - skip
        }
      };

      this.socket.onclose = () => {
        this.notifyConnectionCallbacks(false);
        this.attemptReconnect();
      };

      this.socket.onerror = () => {
        // Connection error - will trigger onclose for reconnect
      };
    } catch {
      // Failed to create WebSocket - connection callbacks will not fire
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.conversationId = null;
    this.reconnectAttempts = 0;
  }

  send(content: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ content }));
    }
    // If not connected, message is silently dropped - UI should check isConnected first
  }

  onMessage(callback: WebSocketCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  private notifyMessageCallbacks(message: Message): void {
    this.messageCallbacks.forEach((callback) => callback(message));
  }

  private notifyConnectionCallbacks(connected: boolean): void {
    this.connectionCallbacks.forEach((callback) => callback(connected));
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.conversationId) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), config.timeouts.websocketReconnect);

    this.reconnectTimeout = setTimeout(() => {
      if (this.conversationId) {
        this.connect(this.conversationId);
      }
    }, delay);
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const chatWebSocket = new ChatWebSocket();
