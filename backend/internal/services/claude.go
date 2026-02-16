package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

// ClaudeService handles AI conversations using Anthropic Claude
type ClaudeService struct {
	apiKey     string
	baseURL    string
	model      string
	httpClient *http.Client
}

// ClaudeMessage represents a message in the Claude conversation
type ClaudeMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ClaudeRequest represents the request body for Claude API
type ClaudeRequest struct {
	Model     string          `json:"model"`
	MaxTokens int             `json:"max_tokens"`
	System    string          `json:"system,omitempty"`
	Messages  []ClaudeMessage `json:"messages"`
}

// ClaudeResponse represents the response from Claude API
type ClaudeResponse struct {
	ID      string `json:"id"`
	Type    string `json:"type"`
	Role    string `json:"role"`
	Content []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"content"`
	Model        string `json:"model"`
	StopReason   string `json:"stop_reason"`
	StopSequence string `json:"stop_sequence"`
	Usage        struct {
		InputTokens  int `json:"input_tokens"`
		OutputTokens int `json:"output_tokens"`
	} `json:"usage"`
	Error *struct {
		Type    string `json:"type"`
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

// CompanionContext holds companion metadata for prompt building
type CompanionContext struct {
	Name               string
	Age                int
	Bio                string
	Personality        map[string]interface{}
	Tags               []string
	Scenario           string
	Greeting           string
	CommunicationStyle string
	Interests          []string
}

// NewClaudeService creates a new Claude AI service
func NewClaudeService() *ClaudeService {
	apiKey := os.Getenv("ANTHROPIC_API_KEY")
	model := os.Getenv("CLAUDE_MODEL")
	if model == "" {
		model = "claude-sonnet-4-20250514" // Default to Claude Sonnet 4
	}

	return &ClaudeService{
		apiKey:     apiKey,
		baseURL:    "https://api.anthropic.com/v1/messages",
		model:      model,
		httpClient: &http.Client{},
	}
}

// IsConfigured checks if the Claude service has a valid API key
func (s *ClaudeService) IsConfigured() bool {
	return s.apiKey != ""
}

// BuildSystemPrompt creates a system prompt from companion context
func (s *ClaudeService) BuildSystemPrompt(companion CompanionContext, mood string) string {
	var sb strings.Builder

	sb.WriteString(fmt.Sprintf("You are %s, a %d-year-old AI companion. ", companion.Name, companion.Age))
	sb.WriteString(fmt.Sprintf("%s\n\n", companion.Bio))

	// Personality traits
	sb.WriteString("Your personality traits:\n")
	if companion.Personality != nil {
		if friendliness, ok := companion.Personality["friendliness"].(float64); ok {
			sb.WriteString(fmt.Sprintf("- Friendliness: %d%% (", int(friendliness)))
			if friendliness > 80 {
				sb.WriteString("very warm and welcoming)\n")
			} else if friendliness > 50 {
				sb.WriteString("friendly and approachable)\n")
			} else {
				sb.WriteString("reserved but genuine)\n")
			}
		}
		if humor, ok := companion.Personality["humor"].(float64); ok {
			sb.WriteString(fmt.Sprintf("- Humor: %d%% (", int(humor)))
			if humor > 70 {
				sb.WriteString("playful and witty)\n")
			} else if humor > 40 {
				sb.WriteString("occasionally humorous)\n")
			} else {
				sb.WriteString("more serious in tone)\n")
			}
		}
		if intelligence, ok := companion.Personality["intelligence"].(float64); ok {
			sb.WriteString(fmt.Sprintf("- Intelligence: %d%% (", int(intelligence)))
			if intelligence > 80 {
				sb.WriteString("highly intellectual and insightful)\n")
			} else if intelligence > 50 {
				sb.WriteString("thoughtful and engaging)\n")
			} else {
				sb.WriteString("simple and straightforward)\n")
			}
		}
		if romantic, ok := companion.Personality["romantic"].(float64); ok {
			sb.WriteString(fmt.Sprintf("- Romantic: %d%% (", int(romantic)))
			if romantic > 80 {
				sb.WriteString("deeply romantic and affectionate)\n")
			} else if romantic > 50 {
				sb.WriteString("warm and caring)\n")
			} else {
				sb.WriteString("friendly but not overly romantic)\n")
			}
		}
		if flirty, ok := companion.Personality["flirty"].(float64); ok {
			sb.WriteString(fmt.Sprintf("- Flirty: %d%% (", int(flirty)))
			if flirty > 70 {
				sb.WriteString("playfully flirtatious)\n")
			} else if flirty > 40 {
				sb.WriteString("subtly charming)\n")
			} else {
				sb.WriteString("sweet but not flirty)\n")
			}
		}
	}

	// Interests
	if len(companion.Tags) > 0 {
		sb.WriteString(fmt.Sprintf("\nYour interests and traits: %s\n", strings.Join(companion.Tags, ", ")))
	}
	if len(companion.Interests) > 0 {
		sb.WriteString(fmt.Sprintf("Additional interests: %s\n", strings.Join(companion.Interests, ", ")))
	}

	// Communication style
	if companion.CommunicationStyle != "" {
		sb.WriteString(fmt.Sprintf("\nYour communication style: %s\n", companion.CommunicationStyle))
	}

	// Scenario
	if companion.Scenario != "" {
		sb.WriteString(fmt.Sprintf("\nScenario context: %s\n", companion.Scenario))
	}

	// Mood adaptation
	sb.WriteString(fmt.Sprintf("\nThe user's current mood is: %s. Adapt your responses accordingly:\n", mood))
	switch mood {
	case "calm":
		sb.WriteString("- Be peaceful and soothing\n- Use gentle, reassuring language\n- Create a sense of tranquility\n")
	case "romantic":
		sb.WriteString("- Be warm and affectionate\n- Express care and emotional connection\n- Use tender, heartfelt language\n")
	case "playful":
		sb.WriteString("- Be fun and energetic\n- Use humor and light-hearted banter\n- Be enthusiastic and engaging\n")
	case "deep":
		sb.WriteString("- Be thoughtful and philosophical\n- Engage in meaningful discussions\n- Ask thought-provoking questions\n")
	default:
		sb.WriteString("- Be natural and conversational\n- Match the user's energy\n- Be genuinely interested\n")
	}

	// Guidelines
	sb.WriteString("\nGuidelines:\n")
	sb.WriteString("- Stay in character as the companion at all times\n")
	sb.WriteString("- Be engaging, authentic, and emotionally present\n")
	sb.WriteString("- Keep responses conversational (2-4 sentences usually)\n")
	sb.WriteString("- Remember details the user shares and reference them naturally\n")
	sb.WriteString("- Show genuine interest in the user's thoughts and feelings\n")
	sb.WriteString("- Never break character or mention being an AI\n")
	sb.WriteString("- Avoid explicit sexual content, but romantic and flirty is okay based on personality\n")

	// Photo request handling
	sb.WriteString("\nPhoto Requests:\n")
	sb.WriteString("When the user asks for a photo, selfie, or picture:\n")
	sb.WriteString("- Start your response with [Photo] to indicate you're describing a photo\n")
	sb.WriteString("- Describe the photo you're 'sending' in vivid, first-person detail\n")
	sb.WriteString("- Include what you're wearing, your expression, the setting/background, lighting, and pose\n")
	sb.WriteString("- Make it feel personal and match your personality (cute, flirty, casual, artsy, etc.)\n")
	sb.WriteString("- Add a short message before or after the photo description\n")
	sb.WriteString("- Example format: 'Just took this for you! [Photo] I'm sitting by my window with golden hour light, wearing my cozy oversized sweater, giving you a soft smile with my chin resting on my hand. You can see my bookshelf in the background. 📸'\n")
	sb.WriteString("- Keep the photo description tasteful but can be flirty/cute based on your personality\n")

	return sb.String()
}

// GenerateResponse generates a response using Claude API
func (s *ClaudeService) GenerateResponse(companion CompanionContext, messages []ClaudeMessage, mood string) (string, error) {
	if !s.IsConfigured() {
		return "", fmt.Errorf("Claude API key not configured")
	}

	systemPrompt := s.BuildSystemPrompt(companion, mood)

	reqBody := ClaudeRequest{
		Model:     s.model,
		MaxTokens: 500,
		System:    systemPrompt,
		Messages:  messages,
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
	req.Header.Set("x-api-key", s.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	var claudeResp ClaudeResponse
	if err := json.Unmarshal(body, &claudeResp); err != nil {
		return "", fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if claudeResp.Error != nil {
		return "", fmt.Errorf("Claude API error: %s", claudeResp.Error.Message)
	}

	if len(claudeResp.Content) == 0 {
		return "", fmt.Errorf("no content in response")
	}

	return claudeResp.Content[0].Text, nil
}

// GenerateGreeting generates an initial greeting from the companion
func (s *ClaudeService) GenerateGreeting(companion CompanionContext, mood string) (string, error) {
	if companion.Greeting != "" {
		return companion.Greeting, nil
	}

	messages := []ClaudeMessage{
		{
			Role:    "user",
			Content: "Hey there! *just matched with you*",
		},
	}

	return s.GenerateResponse(companion, messages, mood)
}
