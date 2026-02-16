package api

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"

	"nectar-ai-companion/internal/models"
	"nectar-ai-companion/internal/services"
	"nectar-ai-companion/internal/websocket"
)

// Handlers contains all API handlers
type Handlers struct {
	db                  *sql.DB
	authService         *services.AuthService
	aiService           *services.AIService
	claudeService       *services.ClaudeService
	groqService         *services.GroqService
	falService          *services.FalService
	huggingFaceService  *services.HuggingFaceService
	wsHub               *websocket.Hub
}

// NewHandlers creates a new handlers instance
func NewHandlers(db *sql.DB, hub *websocket.Hub) *Handlers {
	return &Handlers{
		db:                  db,
		authService:         services.NewAuthService(db),
		aiService:           services.NewAIService(),
		claudeService:       services.NewClaudeService(),
		groqService:         services.NewGroqService(),
		falService:          services.NewFalService(),
		huggingFaceService:  services.NewHuggingFaceService(),
		wsHub:               hub,
	}
}

// Auth Handlers

func (h *Handlers) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: err.Error()})
		return
	}

	user, token, err := h.authService.Register(&req)
	if err != nil {
		status := http.StatusInternalServerError
		if err == services.ErrEmailExists || err == services.ErrUsernameExists {
			status = http.StatusConflict
		}
		c.JSON(status, models.APIResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Data: models.AuthResponse{User: user, Token: token},
	})
}

func (h *Handlers) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: err.Error()})
		return
	}

	user, token, err := h.authService.Login(&req)
	if err != nil {
		status := http.StatusInternalServerError
		if err == services.ErrInvalidCredentials {
			status = http.StatusUnauthorized
		}
		c.JSON(status, models.APIResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Data: models.AuthResponse{User: user, Token: token},
	})
}

func (h *Handlers) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{Error: "unauthorized"})
		return
	}

	user, err := h.authService.GetUserByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Data: user})
}

// Companion Handlers

func (h *Handlers) ListCompanions(c *gin.Context) {
	category := c.Query("category")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	var query string
	var args []interface{}

	if category != "" && category != "all" {
		query = `SELECT id, name, category, bio, avatar_url, personality_json, tags, age, status,
			COALESCE(style, 'realistic'), scenario, greeting, COALESCE(appearance_json, '{}'),
			interests, COALESCE(communication_style, 'friendly'), gallery_urls,
			COALESCE(is_featured, false), COALESCE(message_count, 0), created_at
			FROM companions WHERE category = $1 ORDER BY is_featured DESC, created_at DESC LIMIT $2 OFFSET $3`
		args = []interface{}{category, pageSize, offset}
	} else {
		query = `SELECT id, name, category, bio, avatar_url, personality_json, tags, age, status,
			COALESCE(style, 'realistic'), scenario, greeting, COALESCE(appearance_json, '{}'),
			interests, COALESCE(communication_style, 'friendly'), gallery_urls,
			COALESCE(is_featured, false), COALESCE(message_count, 0), created_at
			FROM companions ORDER BY is_featured DESC, created_at DESC LIMIT $1 OFFSET $2`
		args = []interface{}{pageSize, offset}
	}

	rows, err := h.db.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}
	defer rows.Close()

	var companions []models.Companion
	for rows.Next() {
		var comp models.Companion
		err := rows.Scan(
			&comp.ID, &comp.Name, &comp.Category, &comp.Bio,
			&comp.AvatarURL, &comp.PersonalityJSON, pq.Array(&comp.Tags),
			&comp.Age, &comp.Status, &comp.Style, &comp.Scenario, &comp.Greeting,
			&comp.AppearanceJSON, pq.Array(&comp.Interests), &comp.CommunicationStyle,
			pq.Array(&comp.GalleryURLs), &comp.IsFeatured, &comp.MessageCount, &comp.CreatedAt,
		)
		if err != nil {
			continue
		}
		companions = append(companions, comp)
	}

	// Get total count
	var total int
	if category != "" && category != "all" {
		h.db.QueryRow("SELECT COUNT(*) FROM companions WHERE category = $1", category).Scan(&total)
	} else {
		h.db.QueryRow("SELECT COUNT(*) FROM companions").Scan(&total)
	}

	totalPages := (total + pageSize - 1) / pageSize

	c.JSON(http.StatusOK, models.PaginatedResponse{
		Data:       companions,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

func (h *Handlers) GetCompanion(c *gin.Context) {
	id := c.Param("id")

	var comp models.Companion
	err := h.db.QueryRow(
		`SELECT id, name, category, bio, avatar_url, personality_json, tags, age, status,
			COALESCE(style, 'realistic'), scenario, greeting, COALESCE(appearance_json, '{}'),
			interests, COALESCE(communication_style, 'friendly'), gallery_urls,
			COALESCE(is_featured, false), COALESCE(message_count, 0), created_at
		FROM companions WHERE id = $1`, id,
	).Scan(
		&comp.ID, &comp.Name, &comp.Category, &comp.Bio,
		&comp.AvatarURL, &comp.PersonalityJSON, pq.Array(&comp.Tags),
		&comp.Age, &comp.Status, &comp.Style, &comp.Scenario, &comp.Greeting,
		&comp.AppearanceJSON, pq.Array(&comp.Interests), &comp.CommunicationStyle,
		pq.Array(&comp.GalleryURLs), &comp.IsFeatured, &comp.MessageCount, &comp.CreatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, models.APIResponse{Error: "companion not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Data: comp})
}

func (h *Handlers) CreateCompanion(c *gin.Context) {
	var req struct {
		Name               string             `json:"name" binding:"required"`
		Category           string             `json:"category" binding:"required,oneof=girls guys anime"`
		Bio                string             `json:"bio"`
		AvatarURL          string             `json:"avatarUrl"`
		Personality        models.Personality `json:"personality"`
		Tags               []string           `json:"tags"`
		Age                int                `json:"age" binding:"required,min=18,max=100"`
		Greeting           string             `json:"greeting"`
		Scenario           string             `json:"scenario"`
		CommunicationStyle string             `json:"communicationStyle"`
		Interests          []string           `json:"interests"`
		Appearance         map[string]string  `json:"appearance"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: err.Error()})
		return
	}

	// Generate readable ID from name
	id := generateSlug(req.Name)

	// Check if ID already exists, append random suffix if so
	var existingID string
	err := h.db.QueryRow("SELECT id FROM companions WHERE id = $1", id).Scan(&existingID)
	if err == nil {
		// ID exists, append random suffix
		id = id + "-" + uuid.New().String()[:8]
	}

	// Set defaults
	if req.CommunicationStyle == "" {
		req.CommunicationStyle = "friendly"
	}

	comp := models.Companion{
		ID:        id,
		Name:      req.Name,
		Category:  req.Category,
		Bio:       req.Bio,
		AvatarURL: req.AvatarURL,
		PersonalityJSON: models.JSONB{
			"friendliness": req.Personality.Friendliness,
			"humor":        req.Personality.Humor,
			"intelligence": req.Personality.Intelligence,
			"romantic":     req.Personality.Romantic,
			"flirty":       req.Personality.Flirty,
		},
		Tags:               req.Tags,
		Age:                req.Age,
		Status:             "online",
		CommunicationStyle: req.CommunicationStyle,
		Interests:          req.Interests,
		CreatedAt:          time.Now(),
	}

	// Handle optional fields
	if req.Greeting != "" {
		comp.Greeting = &req.Greeting
	}
	if req.Scenario != "" {
		comp.Scenario = &req.Scenario
	}
	if req.Appearance != nil {
		comp.AppearanceJSON = models.JSONB{}
		for k, v := range req.Appearance {
			comp.AppearanceJSON[k] = v
		}
	}

	_, err = h.db.Exec(
		`INSERT INTO companions (id, name, category, bio, avatar_url, personality_json, tags, age, status, greeting, scenario, communication_style, interests, appearance_json)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
		comp.ID, comp.Name, comp.Category, comp.Bio, comp.AvatarURL,
		comp.PersonalityJSON, pq.Array(comp.Tags), comp.Age, comp.Status,
		comp.Greeting, comp.Scenario, comp.CommunicationStyle, pq.Array(comp.Interests), comp.AppearanceJSON,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{Data: comp})
}

// generateSlug creates a URL-friendly slug from a name
func generateSlug(name string) string {
	// Convert to lowercase
	slug := strings.ToLower(name)
	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")
	// Remove non-alphanumeric characters except hyphens
	var result strings.Builder
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			result.WriteRune(r)
		}
	}
	slug = result.String()
	// Remove multiple consecutive hyphens
	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}
	// Trim hyphens from start and end
	slug = strings.Trim(slug, "-")
	// Add prefix
	if slug == "" {
		slug = "companion-" + uuid.New().String()[:8]
	}
	return slug
}

// Story Handlers

func (h *Handlers) ListStories(c *gin.Context) {
	userID, _ := c.Get("userID")

	rows, err := h.db.Query(
		`SELECT s.id, s.companion_id, s.media_url, s.media_type, s.caption, s.order_index, s.expires_at, s.created_at,
			EXISTS(SELECT 1 FROM story_views sv WHERE sv.story_id = s.id AND sv.user_id = $1) as viewed
		FROM stories s
		WHERE s.expires_at > NOW()
		ORDER BY s.created_at DESC`,
		userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}
	defer rows.Close()

	var stories []models.Story
	for rows.Next() {
		var story models.Story
		err := rows.Scan(
			&story.ID, &story.CompanionID, &story.MediaURL, &story.MediaType,
			&story.Caption, &story.OrderIndex, &story.ExpiresAt, &story.CreatedAt, &story.Viewed,
		)
		if err != nil {
			continue
		}
		stories = append(stories, story)
	}

	c.JSON(http.StatusOK, models.APIResponse{Data: stories})
}

func (h *Handlers) GetStoriesByCompanion(c *gin.Context) {
	companionID := c.Param("companionId")
	userID, _ := c.Get("userID")

	rows, err := h.db.Query(
		`SELECT s.id, s.companion_id, s.media_url, s.media_type, s.caption, s.order_index, s.expires_at, s.created_at,
			EXISTS(SELECT 1 FROM story_views sv WHERE sv.story_id = s.id AND sv.user_id = $1) as viewed
		FROM stories s
		WHERE s.companion_id = $2 AND s.expires_at > NOW()
		ORDER BY s.order_index ASC`,
		userID, companionID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}
	defer rows.Close()

	var stories []models.Story
	for rows.Next() {
		var story models.Story
		err := rows.Scan(
			&story.ID, &story.CompanionID, &story.MediaURL, &story.MediaType,
			&story.Caption, &story.OrderIndex, &story.ExpiresAt, &story.CreatedAt, &story.Viewed,
		)
		if err != nil {
			continue
		}
		stories = append(stories, story)
	}

	c.JSON(http.StatusOK, models.APIResponse{Data: stories})
}

func (h *Handlers) ViewStory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{Error: "unauthorized"})
		return
	}

	var req models.ViewStoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: err.Error()})
		return
	}

	_, err := h.db.Exec(
		`INSERT INTO story_views (id, story_id, user_id) VALUES ($1, $2, $3)
		ON CONFLICT (story_id, user_id) DO NOTHING`,
		uuid.New().String(), req.StoryID, userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Message: "story viewed"})
}

// Chat Handlers

func (h *Handlers) StartChat(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{Error: "unauthorized"})
		return
	}

	var req models.StartChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: err.Error()})
		return
	}

	// Check if conversation exists
	var conv models.Conversation
	err := h.db.QueryRow(
		`SELECT id, user_id, companion_id, created_at FROM conversations
		WHERE user_id = $1 AND companion_id = $2`,
		userID, req.CompanionID,
	).Scan(&conv.ID, &conv.UserID, &conv.CompanionID, &conv.CreatedAt)

	if err == sql.ErrNoRows {
		// Create new conversation
		conv = models.Conversation{
			ID:          uuid.New().String(),
			UserID:      userID.(string),
			CompanionID: req.CompanionID,
			CreatedAt:   time.Now(),
		}

		_, err = h.db.Exec(
			`INSERT INTO conversations (id, user_id, companion_id) VALUES ($1, $2, $3)`,
			conv.ID, conv.UserID, conv.CompanionID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
			return
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Data: conv})
}

func (h *Handlers) SendMessage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{Error: "unauthorized"})
		return
	}

	var req models.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: err.Error()})
		return
	}

	// Verify conversation belongs to user
	var companionID string
	err := h.db.QueryRow(
		`SELECT companion_id FROM conversations WHERE id = $1 AND user_id = $2`,
		req.ConversationID, userID,
	).Scan(&companionID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, models.APIResponse{Error: "conversation not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	// Create user message
	userMsg := models.Message{
		ID:             uuid.New().String(),
		ConversationID: req.ConversationID,
		Sender:         "user",
		Content:        req.Content,
		CreatedAt:      time.Now(),
	}

	_, err = h.db.Exec(
		`INSERT INTO messages (id, conversation_id, sender, content) VALUES ($1, $2, $3, $4)`,
		userMsg.ID, userMsg.ConversationID, userMsg.Sender, userMsg.Content,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	// Get user's current mood
	var mood string
	h.db.QueryRow(
		`SELECT mood_type FROM moods WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
		userID,
	).Scan(&mood)
	if mood == "" {
		mood = "romantic"
	}

	var aiContent string

	// Try to use Claude if configured
	if h.claudeService.IsConfigured() {
		// Fetch companion data
		var comp models.Companion
		err := h.db.QueryRow(
			`SELECT id, name, category, bio, avatar_url, personality_json, tags, age, status,
				COALESCE(style, 'realistic'), scenario, greeting, COALESCE(appearance_json, '{}'),
				interests, COALESCE(communication_style, 'friendly'), gallery_urls,
				COALESCE(is_featured, false), COALESCE(message_count, 0), created_at
			FROM companions WHERE id = $1`, companionID,
		).Scan(
			&comp.ID, &comp.Name, &comp.Category, &comp.Bio,
			&comp.AvatarURL, &comp.PersonalityJSON, pq.Array(&comp.Tags),
			&comp.Age, &comp.Status, &comp.Style, &comp.Scenario, &comp.Greeting,
			&comp.AppearanceJSON, pq.Array(&comp.Interests), &comp.CommunicationStyle,
			pq.Array(&comp.GalleryURLs), &comp.IsFeatured, &comp.MessageCount, &comp.CreatedAt,
		)

		if err == nil {
			// Build companion context
			companionCtx := services.CompanionContext{
				Name:               comp.Name,
				Age:                comp.Age,
				Bio:                comp.Bio,
				Personality:        comp.PersonalityJSON,
				Tags:               comp.Tags,
				CommunicationStyle: comp.CommunicationStyle,
				Interests:          comp.Interests,
			}
			if comp.Scenario != nil {
				companionCtx.Scenario = *comp.Scenario
			}
			if comp.Greeting != nil {
				companionCtx.Greeting = *comp.Greeting
			}

			// Get recent conversation history
			rows, err := h.db.Query(
				`SELECT sender, content FROM messages
				WHERE conversation_id = $1
				ORDER BY created_at DESC LIMIT 10`,
				req.ConversationID,
			)
			if err == nil {
				defer rows.Close()
				var messages []services.ClaudeMessage
				for rows.Next() {
					var sender, content string
					if err := rows.Scan(&sender, &content); err == nil {
						role := "user"
						if sender == "ai" {
							role = "assistant"
						}
						messages = append([]services.ClaudeMessage{{Role: role, Content: content}}, messages...)
					}
				}

				// Generate response with Claude
				response, err := h.claudeService.GenerateResponse(companionCtx, messages, mood)
				if err == nil {
					aiContent = response
				}
			}
		}
	}

	// Fallback to simple AI if Claude failed or not configured
	if aiContent == "" {
		aiContent = h.aiService.GenerateReply([]string{req.Content}, mood)
	}

	aiMsg := models.Message{
		ID:             uuid.New().String(),
		ConversationID: req.ConversationID,
		Sender:         "ai",
		Content:        aiContent,
		CreatedAt:      time.Now(),
	}

	_, err = h.db.Exec(
		`INSERT INTO messages (id, conversation_id, sender, content) VALUES ($1, $2, $3, $4)`,
		aiMsg.ID, aiMsg.ConversationID, aiMsg.Sender, aiMsg.Content,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	// Broadcast to WebSocket clients
	h.wsHub.BroadcastToConversation(req.ConversationID, &aiMsg)

	c.JSON(http.StatusOK, models.APIResponse{
		Data: models.SendMessageResponse{
			UserMessage: &userMsg,
			AIMessage:   &aiMsg,
		},
	})
}

func (h *Handlers) GetChatHistory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{Error: "unauthorized"})
		return
	}

	companionID := c.Param("companionId")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 50
	}

	offset := (page - 1) * pageSize

	// Get conversation
	var conversationID string
	err := h.db.QueryRow(
		`SELECT id FROM conversations WHERE user_id = $1 AND companion_id = $2`,
		userID, companionID,
	).Scan(&conversationID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusOK, models.PaginatedResponse{
			Data:       []models.Message{},
			Total:      0,
			Page:       page,
			PageSize:   pageSize,
			TotalPages: 0,
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	// Get messages
	rows, err := h.db.Query(
		`SELECT id, conversation_id, sender, content, created_at
		FROM messages WHERE conversation_id = $1
		ORDER BY created_at ASC LIMIT $2 OFFSET $3`,
		conversationID, pageSize, offset,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var msg models.Message
		if err := rows.Scan(&msg.ID, &msg.ConversationID, &msg.Sender, &msg.Content, &msg.CreatedAt); err != nil {
			continue
		}
		messages = append(messages, msg)
	}

	// Get total count
	var total int
	h.db.QueryRow("SELECT COUNT(*) FROM messages WHERE conversation_id = $1", conversationID).Scan(&total)
	totalPages := (total + pageSize - 1) / pageSize

	c.JSON(http.StatusOK, models.PaginatedResponse{
		Data:       messages,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

// Public Chat Handler (no auth required for demo)
func (h *Handlers) PublicChat(c *gin.Context) {
	var req struct {
		CompanionID string   `json:"companionId" binding:"required"`
		Message     string   `json:"message" binding:"required"`
		History     []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"history"`
		Mood string `json:"mood"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: err.Error()})
		return
	}

	if req.Mood == "" {
		req.Mood = "romantic"
	}

	// Fetch companion data
	var comp models.Companion
	err := h.db.QueryRow(
		`SELECT id, name, category, bio, avatar_url, personality_json, tags, age, status,
			COALESCE(style, 'realistic'), scenario, greeting, COALESCE(appearance_json, '{}'),
			interests, COALESCE(communication_style, 'friendly'), gallery_urls,
			COALESCE(is_featured, false), COALESCE(message_count, 0), created_at
		FROM companions WHERE id = $1`, req.CompanionID,
	).Scan(
		&comp.ID, &comp.Name, &comp.Category, &comp.Bio,
		&comp.AvatarURL, &comp.PersonalityJSON, pq.Array(&comp.Tags),
		&comp.Age, &comp.Status, &comp.Style, &comp.Scenario, &comp.Greeting,
		&comp.AppearanceJSON, pq.Array(&comp.Interests), &comp.CommunicationStyle,
		pq.Array(&comp.GalleryURLs), &comp.IsFeatured, &comp.MessageCount, &comp.CreatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, models.APIResponse{Error: "companion not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	var aiContent string

	// Try to use Claude if configured
	if h.claudeService.IsConfigured() {
		// Build companion context
		companionCtx := services.CompanionContext{
			Name:               comp.Name,
			Age:                comp.Age,
			Bio:                comp.Bio,
			Personality:        comp.PersonalityJSON,
			Tags:               comp.Tags,
			CommunicationStyle: comp.CommunicationStyle,
			Interests:          comp.Interests,
		}
		if comp.Scenario != nil {
			companionCtx.Scenario = *comp.Scenario
		}
		if comp.Greeting != nil {
			companionCtx.Greeting = *comp.Greeting
		}

		// Build message history
		var messages []services.ClaudeMessage
		for _, h := range req.History {
			role := h.Role
			if role == "ai" {
				role = "assistant"
			}
			messages = append(messages, services.ClaudeMessage{Role: role, Content: h.Content})
		}
		// Add current message
		messages = append(messages, services.ClaudeMessage{Role: "user", Content: req.Message})

		// Generate response with Claude
		response, err := h.claudeService.GenerateResponse(companionCtx, messages, req.Mood)
		if err != nil {
			// Log the error but fall back to simple AI
			c.Header("X-AI-Fallback", "true")
			c.Header("X-AI-Error", err.Error())
		} else {
			aiContent = response
		}
	}

	// Try Groq as secondary fallback if Claude failed
	if aiContent == "" && h.groqService.IsConfigured() {
		// Build companion context
		companionCtx := services.CompanionContext{
			Name:               comp.Name,
			Age:                comp.Age,
			Bio:                comp.Bio,
			Personality:        comp.PersonalityJSON,
			Tags:               comp.Tags,
			CommunicationStyle: comp.CommunicationStyle,
			Interests:          comp.Interests,
		}
		if comp.Scenario != nil {
			companionCtx.Scenario = *comp.Scenario
		}
		if comp.Greeting != nil {
			companionCtx.Greeting = *comp.Greeting
		}

		// Build message history
		var messages []services.ClaudeMessage
		for _, h := range req.History {
			role := h.Role
			if role == "ai" {
				role = "assistant"
			}
			messages = append(messages, services.ClaudeMessage{Role: role, Content: h.Content})
		}
		messages = append(messages, services.ClaudeMessage{Role: "user", Content: req.Message})

		response, err := h.groqService.GenerateResponse(companionCtx, messages, req.Mood)
		if err == nil {
			aiContent = response
			c.Header("X-AI-Provider", "groq")
		}
	}

	// Fallback to simple AI if both Claude and Groq failed
	if aiContent == "" {
		aiContent = h.aiService.GenerateReply([]string{req.Message}, req.Mood)
		c.Header("X-AI-Provider", "fallback")
	} else if c.Writer.Header().Get("X-AI-Provider") == "" {
		c.Header("X-AI-Provider", "claude")
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Data: map[string]interface{}{
			"response":    aiContent,
			"companionId": comp.ID,
			"companion":   comp.Name,
		},
	})
}

// Memory Handlers

func (h *Handlers) ListMemories(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{Error: "unauthorized"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	rows, err := h.db.Query(
		`SELECT id, user_id, companion_id, event_type, metadata, created_at
		FROM memories WHERE user_id = $1
		ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
		userID, pageSize, offset,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}
	defer rows.Close()

	var memories []models.Memory
	for rows.Next() {
		var mem models.Memory
		if err := rows.Scan(&mem.ID, &mem.UserID, &mem.CompanionID, &mem.EventType, &mem.Metadata, &mem.CreatedAt); err != nil {
			continue
		}
		memories = append(memories, mem)
	}

	// Get total count
	var total int
	h.db.QueryRow("SELECT COUNT(*) FROM memories WHERE user_id = $1", userID).Scan(&total)
	totalPages := (total + pageSize - 1) / pageSize

	c.JSON(http.StatusOK, models.PaginatedResponse{
		Data:       memories,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

// Mood Handlers

func (h *Handlers) SetMood(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{Error: "unauthorized"})
		return
	}

	var req models.SetMoodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: err.Error()})
		return
	}

	mood := models.Mood{
		ID:        uuid.New().String(),
		UserID:    userID.(string),
		MoodType:  req.MoodType,
		CreatedAt: time.Now(),
	}

	_, err := h.db.Exec(
		`INSERT INTO moods (id, user_id, mood_type) VALUES ($1, $2, $3)`,
		mood.ID, mood.UserID, mood.MoodType,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Data: mood})
}

func (h *Handlers) GetMood(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{Error: "unauthorized"})
		return
	}

	var mood models.Mood
	err := h.db.QueryRow(
		`SELECT id, user_id, mood_type, created_at FROM moods
		WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
		userID,
	).Scan(&mood.ID, &mood.UserID, &mood.MoodType, &mood.CreatedAt)

	if err == sql.ErrNoRows {
		// Return default mood
		c.JSON(http.StatusOK, models.APIResponse{
			Data: models.Mood{
				UserID:   userID.(string),
				MoodType: "romantic",
			},
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Data: mood})
}

// Image Generation Handlers

// GenerateCompanionPhoto generates an AI image for a companion
func (h *Handlers) GenerateCompanionPhoto(c *gin.Context) {
	var req struct {
		CompanionID string `json:"companionId" binding:"required"`
		PhotoType   string `json:"photoType"` // selfie, portrait, full_body, candid, flirty, cute, romantic
		Context     string `json:"context"`   // Additional context for the image
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: err.Error()})
		return
	}

	if !h.huggingFaceService.IsConfigured() && !h.falService.IsConfigured() {
		c.JSON(http.StatusServiceUnavailable, models.APIResponse{Error: "Image generation service not configured"})
		return
	}

	// Fetch companion data
	var comp models.Companion
	err := h.db.QueryRow(
		`SELECT id, name, category, bio, avatar_url, personality_json, tags, age, status,
			COALESCE(style, 'realistic'), scenario, greeting, COALESCE(appearance_json, '{}'),
			interests, COALESCE(communication_style, 'friendly'), gallery_urls,
			COALESCE(is_featured, false), COALESCE(message_count, 0), created_at
		FROM companions WHERE id = $1`, req.CompanionID,
	).Scan(
		&comp.ID, &comp.Name, &comp.Category, &comp.Bio,
		&comp.AvatarURL, &comp.PersonalityJSON, pq.Array(&comp.Tags),
		&comp.Age, &comp.Status, &comp.Style, &comp.Scenario, &comp.Greeting,
		&comp.AppearanceJSON, pq.Array(&comp.Interests), &comp.CommunicationStyle,
		pq.Array(&comp.GalleryURLs), &comp.IsFeatured, &comp.MessageCount, &comp.CreatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, models.APIResponse{Error: "companion not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	// Build appearance from companion data
	appearance := services.CompanionAppearance{
		Name:   comp.Name,
		Age:    comp.Age,
		Gender: "woman", // Default
	}

	// Extract appearance details from appearance_json if available
	if comp.AppearanceJSON != nil {
		if gender, ok := comp.AppearanceJSON["gender"].(string); ok {
			appearance.Gender = gender
		}
		if ethnicity, ok := comp.AppearanceJSON["ethnicity"].(string); ok {
			appearance.Ethnicity = ethnicity
		}
		if hairColor, ok := comp.AppearanceJSON["hairColor"].(string); ok {
			appearance.HairColor = hairColor
		}
		if hairStyle, ok := comp.AppearanceJSON["hairStyle"].(string); ok {
			appearance.HairStyle = hairStyle
		}
		if eyeColor, ok := comp.AppearanceJSON["eyeColor"].(string); ok {
			appearance.EyeColor = eyeColor
		}
		if bodyType, ok := comp.AppearanceJSON["bodyType"].(string); ok {
			appearance.BodyType = bodyType
		}
		if style, ok := comp.AppearanceJSON["style"].(string); ok {
			appearance.Style = style
		}
	}

	// Set default photo type
	if req.PhotoType == "" {
		req.PhotoType = "selfie"
	}

	var imageURL string
	var provider string

	// Try Hugging Face first (free)
	if h.huggingFaceService.IsConfigured() {
		url, err := h.huggingFaceService.GenerateCompanionPhoto(appearance, req.Context, req.PhotoType)
		if err == nil {
			imageURL = url
			provider = "huggingface"
		}
	}

	// Fall back to FAL.ai if Hugging Face failed or not configured
	if imageURL == "" && h.falService.IsConfigured() {
		url, err := h.falService.GenerateCompanionPhoto(appearance, req.Context, req.PhotoType)
		if err == nil {
			imageURL = url
			provider = "fal"
		} else {
			c.JSON(http.StatusInternalServerError, models.APIResponse{Error: "Failed to generate image: " + err.Error()})
			return
		}
	}

	if imageURL == "" {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: "Failed to generate image with any provider"})
		return
	}

	c.Header("X-Image-Provider", provider)

	c.JSON(http.StatusOK, models.APIResponse{
		Data: map[string]interface{}{
			"imageUrl":    imageURL,
			"companionId": comp.ID,
			"companion":   comp.Name,
			"photoType":   req.PhotoType,
			"provider":    provider,
		},
	})
}

// Public Chat Persistence Handlers (no auth required for demo)

// SavePublicMessage saves messages for public/demo chat
func (h *Handlers) SavePublicMessage(c *gin.Context) {
	var req struct {
		SessionID   string `json:"sessionId" binding:"required"`
		CompanionID string `json:"companionId" binding:"required"`
		Messages    []struct {
			ID        string  `json:"id" binding:"required"`
			Sender    string  `json:"sender" binding:"required"`
			Content   string  `json:"content"`
			ImageURL  *string `json:"imageUrl"`
			CreatedAt string  `json:"createdAt" binding:"required"`
		} `json:"messages" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: err.Error()})
		return
	}

	// Create or get conversation
	convID := req.SessionID + "-" + req.CompanionID

	_, err := h.db.Exec(
		`INSERT INTO public_conversations (id, session_id, companion_id)
		VALUES ($1, $2, $3)
		ON CONFLICT (session_id, companion_id) DO NOTHING`,
		convID, req.SessionID, req.CompanionID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}

	// Insert messages
	for _, msg := range req.Messages {
		_, err := h.db.Exec(
			`INSERT INTO public_messages (id, conversation_id, sender, content, image_url, created_at)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (id) DO UPDATE SET content = $4, image_url = $5`,
			msg.ID, convID, msg.Sender, msg.Content, msg.ImageURL, msg.CreatedAt,
		)
		if err != nil {
			// Log but continue
			continue
		}
	}

	c.JSON(http.StatusOK, models.APIResponse{Data: map[string]interface{}{
		"saved":          len(req.Messages),
		"conversationId": convID,
	}})
}

// GetPublicChatHistory retrieves chat history for a public session
func (h *Handlers) GetPublicChatHistory(c *gin.Context) {
	sessionID := c.Query("sessionId")
	companionID := c.Param("companionId")

	if sessionID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: "sessionId is required"})
		return
	}

	convID := sessionID + "-" + companionID

	// Check if conversation exists
	var exists bool
	err := h.db.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM public_conversations WHERE id = $1)`,
		convID,
	).Scan(&exists)

	if err != nil || !exists {
		// Return empty array if no conversation
		c.JSON(http.StatusOK, models.APIResponse{Data: []interface{}{}})
		return
	}

	// Get messages
	rows, err := h.db.Query(
		`SELECT id, sender, content, image_url, created_at
		FROM public_messages WHERE conversation_id = $1
		ORDER BY created_at ASC`,
		convID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}
	defer rows.Close()

	var messages []map[string]interface{}
	for rows.Next() {
		var id, sender, content string
		var imageURL *string
		var createdAt time.Time

		if err := rows.Scan(&id, &sender, &content, &imageURL, &createdAt); err != nil {
			continue
		}

		msg := map[string]interface{}{
			"id":        id,
			"sender":    sender,
			"content":   content,
			"createdAt": createdAt.Format(time.RFC3339),
		}
		if imageURL != nil {
			msg["imageUrl"] = *imageURL
		}
		messages = append(messages, msg)
	}

	if messages == nil {
		messages = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, models.APIResponse{Data: messages})
}

// GetPublicConversations retrieves all conversations for a session
func (h *Handlers) GetPublicConversations(c *gin.Context) {
	sessionID := c.Query("sessionId")

	if sessionID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{Error: "sessionId is required"})
		return
	}

	rows, err := h.db.Query(
		`SELECT pc.id, pc.companion_id, pc.created_at,
			(SELECT content FROM public_messages WHERE conversation_id = pc.id ORDER BY created_at DESC LIMIT 1) as last_message,
			(SELECT created_at FROM public_messages WHERE conversation_id = pc.id ORDER BY created_at DESC LIMIT 1) as last_message_at
		FROM public_conversations pc
		WHERE pc.session_id = $1
		ORDER BY last_message_at DESC NULLS LAST`,
		sessionID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Error: err.Error()})
		return
	}
	defer rows.Close()

	var conversations []map[string]interface{}
	for rows.Next() {
		var id, companionID string
		var createdAt time.Time
		var lastMessage, lastMessageAt *string

		if err := rows.Scan(&id, &companionID, &createdAt, &lastMessage, &lastMessageAt); err != nil {
			continue
		}

		conv := map[string]interface{}{
			"id":          id,
			"companionId": companionID,
			"createdAt":   createdAt.Format(time.RFC3339),
		}
		if lastMessage != nil {
			conv["lastMessage"] = *lastMessage
		}
		if lastMessageAt != nil {
			conv["lastMessageAt"] = *lastMessageAt
		}
		conversations = append(conversations, conv)
	}

	if conversations == nil {
		conversations = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, models.APIResponse{Data: conversations})
}
