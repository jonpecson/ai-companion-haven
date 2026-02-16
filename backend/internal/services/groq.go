package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// GroqService handles AI conversations using Groq API (free tier with Llama/Mixtral)
type GroqService struct {
	apiKey     string
	baseURL    string
	model      string
	httpClient *http.Client
}

// GroqMessage represents a message in the Groq conversation
type GroqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// GroqRequest represents the request body for Groq API
type GroqRequest struct {
	Model       string        `json:"model"`
	Messages    []GroqMessage `json:"messages"`
	MaxTokens   int           `json:"max_tokens,omitempty"`
	Temperature float64       `json:"temperature,omitempty"`
}

// GroqResponse represents the response from Groq API
type GroqResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
	Error *struct {
		Message string `json:"message"`
		Type    string `json:"type"`
	} `json:"error,omitempty"`
}

// NewGroqService creates a new Groq AI service
func NewGroqService() *GroqService {
	apiKey := os.Getenv("GROQ_API_KEY")
	model := os.Getenv("GROQ_MODEL")
	if model == "" {
		model = "llama-3.3-70b-versatile" // Default to Llama 3.3 70B (free, fast)
	}

	return &GroqService{
		apiKey:     apiKey,
		baseURL:    "https://api.groq.com/openai/v1/chat/completions",
		model:      model,
		httpClient: &http.Client{},
	}
}

// IsConfigured checks if the Groq service has a valid API key
func (s *GroqService) IsConfigured() bool {
	return s.apiKey != ""
}

// GenerateResponse generates a response using Groq API
func (s *GroqService) GenerateResponse(companion CompanionContext, messages []ClaudeMessage, mood string) (string, error) {
	if !s.IsConfigured() {
		return "", fmt.Errorf("Groq API key not configured")
	}

	// Build system prompt (same as Claude)
	claudeService := &ClaudeService{}
	systemPrompt := claudeService.BuildSystemPrompt(companion, mood)

	// Convert messages to Groq format
	groqMessages := []GroqMessage{
		{Role: "system", Content: systemPrompt},
	}
	for _, msg := range messages {
		groqMessages = append(groqMessages, GroqMessage{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}

	reqBody := GroqRequest{
		Model:       s.model,
		Messages:    groqMessages,
		MaxTokens:   500,
		Temperature: 0.8,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", s.baseURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	var groqResp GroqResponse
	if err := json.Unmarshal(body, &groqResp); err != nil {
		return "", fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if groqResp.Error != nil {
		return "", fmt.Errorf("Groq API error: %s", groqResp.Error.Message)
	}

	if len(groqResp.Choices) == 0 {
		return "", fmt.Errorf("no choices in response")
	}

	return groqResp.Choices[0].Message.Content, nil
}
