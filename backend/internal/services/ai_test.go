package services

import (
	"testing"
)

func TestNewAIService(t *testing.T) {
	service := NewAIService()
	if service == nil {
		t.Error("NewAIService returned nil")
	}
	if len(service.responses) == 0 {
		t.Error("AIService responses map is empty")
	}
}

func TestGenerateReply(t *testing.T) {
	service := NewAIService()

	tests := []struct {
		name     string
		messages []string
		mood     string
	}{
		{
			name:     "Default mood",
			messages: []string{"Hello"},
			mood:     "default",
		},
		{
			name:     "Calm mood",
			messages: []string{"Hello"},
			mood:     "calm",
		},
		{
			name:     "Romantic mood",
			messages: []string{"Hello"},
			mood:     "romantic",
		},
		{
			name:     "Playful mood",
			messages: []string{"Hello"},
			mood:     "playful",
		},
		{
			name:     "Deep mood",
			messages: []string{"Hello"},
			mood:     "deep",
		},
		{
			name:     "Unknown mood falls back to default",
			messages: []string{"Hello"},
			mood:     "unknown",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reply := service.GenerateReply(tt.messages, tt.mood)
			if reply == "" {
				t.Errorf("GenerateReply returned empty string for mood %s", tt.mood)
			}
		})
	}
}

func TestSimulateTypingDelay(t *testing.T) {
	service := NewAIService()
	delay := service.SimulateTypingDelay()

	// Delay should be between 1-3 seconds
	if delay.Milliseconds() < 1000 || delay.Milliseconds() > 3000 {
		t.Errorf("SimulateTypingDelay returned %v, expected between 1000-3000ms", delay.Milliseconds())
	}
}

func TestGenerateContextualReply(t *testing.T) {
	service := NewAIService()

	tests := []struct {
		name        string
		context     []string
		personality map[string]int
		mood        string
	}{
		{
			name:        "Empty context",
			context:     []string{},
			personality: map[string]int{"romantic": 80},
			mood:        "romantic",
		},
		{
			name:        "Short message context",
			context:     []string{"Hi there!"},
			personality: map[string]int{"romantic": 80},
			mood:        "romantic",
		},
		{
			name: "Long message context",
			context: []string{
				"This is a very long message that exceeds one hundred characters. " +
					"It should trigger a different response based on the length of the message.",
			},
			personality: map[string]int{"romantic": 80},
			mood:        "romantic",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reply := service.GenerateContextualReply(tt.context, tt.personality, tt.mood)
			if reply == "" {
				t.Error("GenerateContextualReply returned empty string")
			}
		})
	}
}
