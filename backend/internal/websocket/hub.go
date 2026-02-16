package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"nectar-ai-companion/internal/models"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin in development
		// In production, you should validate the origin
		return true
	},
}

// Client represents a WebSocket client
type Client struct {
	hub            *Hub
	conn           *websocket.Conn
	send           chan []byte
	conversationID string
	userID         string
}

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	// Registered clients grouped by conversation ID
	clients map[string]map[*Client]bool

	// Channel for messages to broadcast
	broadcast chan *BroadcastMessage

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Mutex for thread-safe operations
	mu sync.RWMutex
}

// BroadcastMessage contains a message and the target conversation
type BroadcastMessage struct {
	ConversationID string
	Message        *models.Message
}

// NewHub creates a new Hub instance
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]map[*Client]bool),
		broadcast:  make(chan *BroadcastMessage, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.clients[client.conversationID] == nil {
				h.clients[client.conversationID] = make(map[*Client]bool)
			}
			h.clients[client.conversationID][client] = true
			h.mu.Unlock()
			log.Printf("Client registered for conversation %s", client.conversationID)

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.clients[client.conversationID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.send)
					if len(clients) == 0 {
						delete(h.clients, client.conversationID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("Client unregistered from conversation %s", client.conversationID)

		case message := <-h.broadcast:
			h.mu.RLock()
			clients := h.clients[message.ConversationID]
			h.mu.RUnlock()

			data, err := json.Marshal(message.Message)
			if err != nil {
				log.Printf("Error marshaling message: %v", err)
				continue
			}

			for client := range clients {
				select {
				case client.send <- data:
				default:
					h.mu.Lock()
					delete(h.clients[client.conversationID], client)
					close(client.send)
					h.mu.Unlock()
				}
			}
		}
	}
}

// BroadcastToConversation sends a message to all clients in a conversation
func (h *Hub) BroadcastToConversation(conversationID string, message *models.Message) {
	h.broadcast <- &BroadcastMessage{
		ConversationID: conversationID,
		Message:        message,
	}
}

// HandleWebSocket handles WebSocket upgrade and client management
func HandleWebSocket(hub *Hub, c *gin.Context) {
	conversationID := c.Param("conversationId")
	if conversationID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "conversation ID required"})
		return
	}

	// Get user ID from query parameter (token validation)
	// In production, you should validate the token properly
	userID := c.Query("userId")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Error upgrading connection: %v", err)
		return
	}

	client := &Client{
		hub:            hub,
		conn:           conn,
		send:           make(chan []byte, 256),
		conversationID: conversationID,
		userID:         userID,
	}

	hub.register <- client

	// Start goroutines for reading and writing
	go client.writePump()
	go client.readPump()
}

// readPump pumps messages from the WebSocket connection to the hub
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Parse incoming message
		var incomingMsg struct {
			Content string `json:"content"`
		}
		if err := json.Unmarshal(message, &incomingMsg); err != nil {
			log.Printf("Error parsing message: %v", err)
			continue
		}

		// Here you could handle incoming messages
		// For now, we just log them
		log.Printf("Received message from %s: %s", c.userID, incomingMsg.Content)
	}
}

// writePump pumps messages from the hub to the WebSocket connection
func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current WebSocket message
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		}
	}
}
