package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// JSONB type for PostgreSQL JSONB columns
type JSONB map[string]interface{}

func (j JSONB) Value() (driver.Value, error) {
	return json.Marshal(j)
}

func (j *JSONB) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &j)
}

// User represents a user in the system
type User struct {
	ID        string    `json:"id" db:"id"`
	Email     string    `json:"email" db:"email"`
	Username  string    `json:"username" db:"username"`
	Password  string    `json:"-" db:"password_hash"`
	AvatarURL *string   `json:"avatarUrl,omitempty" db:"avatar_url"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

// Companion represents an AI companion
type Companion struct {
	ID                 string    `json:"id" db:"id"`
	Name               string    `json:"name" db:"name"`
	Category           string    `json:"category" db:"category"`
	Bio                string    `json:"bio" db:"bio"`
	AvatarURL          string    `json:"avatar" db:"avatar_url"`
	PersonalityJSON    JSONB     `json:"personality" db:"personality_json"`
	Tags               []string  `json:"tags"`
	Age                int       `json:"age" db:"age"`
	Status             string    `json:"status" db:"status"`
	Style              string    `json:"style" db:"style"`
	Scenario           *string   `json:"scenario,omitempty" db:"scenario"`
	Greeting           *string   `json:"greeting,omitempty" db:"greeting"`
	AppearanceJSON     JSONB     `json:"appearance,omitempty" db:"appearance_json"`
	Interests          []string  `json:"interests,omitempty"`
	CommunicationStyle string    `json:"communicationStyle" db:"communication_style"`
	GalleryURLs        []string  `json:"galleryUrls,omitempty"`
	IsFeatured         bool      `json:"isFeatured" db:"is_featured"`
	MessageCount       int       `json:"messageCount" db:"message_count"`
	CreatedAt          time.Time `json:"createdAt" db:"created_at"`
}

// Appearance represents companion appearance traits
type Appearance struct {
	Ethnicity string `json:"ethnicity,omitempty"`
	EyeColor  string `json:"eyeColor,omitempty"`
	HairColor string `json:"hairColor,omitempty"`
	HairStyle string `json:"hairStyle,omitempty"`
	BodyType  string `json:"bodyType,omitempty"`
	Height    string `json:"height,omitempty"`
}

// Personality represents companion personality traits
type Personality struct {
	Friendliness int `json:"friendliness"`
	Humor        int `json:"humor"`
	Intelligence int `json:"intelligence"`
	Romantic     int `json:"romantic"`
	Flirty       int `json:"flirty"`
}

// Story represents a companion's story
type Story struct {
	ID          string    `json:"id" db:"id"`
	CompanionID string    `json:"companionId" db:"companion_id"`
	MediaURL    string    `json:"mediaUrl" db:"media_url"`
	MediaType   string    `json:"type" db:"media_type"`
	Caption     *string   `json:"caption,omitempty" db:"caption"`
	OrderIndex  int       `json:"orderIndex" db:"order_index"`
	ExpiresAt   time.Time `json:"expiresAt" db:"expires_at"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	Viewed      bool      `json:"viewed"` // Computed field
}

// StoryView represents a story view by a user
type StoryView struct {
	ID       string    `json:"id" db:"id"`
	StoryID  string    `json:"storyId" db:"story_id"`
	UserID   string    `json:"userId" db:"user_id"`
	ViewedAt time.Time `json:"viewedAt" db:"viewed_at"`
}

// Conversation represents a chat conversation
type Conversation struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"userId" db:"user_id"`
	CompanionID string    `json:"companionId" db:"companion_id"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

// Message represents a chat message
type Message struct {
	ID             string    `json:"id" db:"id"`
	ConversationID string    `json:"conversationId" db:"conversation_id"`
	Sender         string    `json:"sender" db:"sender"`
	Content        string    `json:"content" db:"content"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
}

// Memory represents a user's memory with a companion
type Memory struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"userId" db:"user_id"`
	CompanionID string    `json:"companionId" db:"companion_id"`
	EventType   string    `json:"eventType" db:"event_type"`
	Metadata    JSONB     `json:"metadata" db:"metadata"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

// Mood represents a user's mood setting
type Mood struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"userId" db:"user_id"`
	MoodType  string    `json:"moodType" db:"mood_type"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

// API Request/Response types

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	User  *User  `json:"user"`
	Token string `json:"token"`
}

type CreateCompanionRequest struct {
	Name        string      `json:"name" binding:"required"`
	Category    string      `json:"category" binding:"required,oneof=girls guys anime"`
	Bio         string      `json:"bio"`
	AvatarURL   string      `json:"avatarUrl"`
	Personality Personality `json:"personality"`
	Tags        []string    `json:"tags"`
	Age         int         `json:"age" binding:"required,min=18,max=100"`
}

type StartChatRequest struct {
	CompanionID string `json:"companionId" binding:"required"`
}

type SendMessageRequest struct {
	ConversationID string `json:"conversationId" binding:"required"`
	Content        string `json:"content" binding:"required"`
}

type SendMessageResponse struct {
	UserMessage *Message `json:"userMessage"`
	AIMessage   *Message `json:"aiMessage"`
}

type ViewStoryRequest struct {
	StoryID string `json:"storyId" binding:"required"`
}

type SetMoodRequest struct {
	MoodType string `json:"moodType" binding:"required,oneof=calm romantic playful deep"`
}

type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"pageSize"`
	TotalPages int         `json:"totalPages"`
}

type APIResponse struct {
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
	Error   string      `json:"error,omitempty"`
}
