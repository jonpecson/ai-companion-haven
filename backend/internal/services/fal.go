package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// FalService handles AI image generation using FAL.ai
type FalService struct {
	apiKey     string
	baseURL    string
	httpClient *http.Client
}

// FalRequest represents the request body for FAL.ai image generation
type FalRequest struct {
	Prompt         string `json:"prompt"`
	NegativePrompt string `json:"negative_prompt,omitempty"`
	ImageSize      string `json:"image_size,omitempty"`
	NumImages      int    `json:"num_images,omitempty"`
	EnableSafeMode bool   `json:"enable_safety_checker"`
	Seed           int    `json:"seed,omitempty"`
}

// FalResponse represents the response from FAL.ai
type FalResponse struct {
	Images []struct {
		URL         string `json:"url"`
		Width       int    `json:"width"`
		Height      int    `json:"height"`
		ContentType string `json:"content_type"`
	} `json:"images"`
	Seed      int    `json:"seed"`
	Timings   any    `json:"timings"`
	HasNSFW   bool   `json:"has_nsfw_concepts"`
	RequestID string `json:"request_id"`
}

// FalQueueResponse represents the queue response
type FalQueueResponse struct {
	RequestID string `json:"request_id"`
	Status    string `json:"status"`
}

// FalStatusResponse represents the status check response
type FalStatusResponse struct {
	Status        string       `json:"status"`
	ResponseURL   string       `json:"response_url"`
	Response      *FalResponse `json:"response,omitempty"`
	Error         string       `json:"error,omitempty"`
	QueuePosition int          `json:"queue_position,omitempty"`
}

// NewFalService creates a new FAL.ai image generation service
func NewFalService() *FalService {
	apiKey := os.Getenv("FAL_API_KEY")

	return &FalService{
		apiKey:  apiKey,
		baseURL: "https://queue.fal.run/fal-ai/flux/schnell",
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

// IsConfigured checks if the FAL service has a valid API key
func (s *FalService) IsConfigured() bool {
	return s.apiKey != ""
}

// CompanionAppearance holds the visual description of a companion
type CompanionAppearance struct {
	Name        string
	Gender      string
	Age         int
	Ethnicity   string
	HairColor   string
	HairStyle   string
	EyeColor    string
	BodyType    string
	Style       string
	Personality string
}

// BuildImagePrompt creates an image generation prompt for a companion
func (s *FalService) BuildImagePrompt(appearance CompanionAppearance, context string, photoType string) string {
	var sb strings.Builder

	// Base quality tags
	sb.WriteString("photo of a beautiful ")

	// Age and gender
	if appearance.Age > 0 {
		sb.WriteString(fmt.Sprintf("%d year old ", appearance.Age))
	}
	if appearance.Gender != "" {
		sb.WriteString(appearance.Gender + " ")
	} else {
		sb.WriteString("woman ")
	}

	// Ethnicity
	if appearance.Ethnicity != "" {
		sb.WriteString(appearance.Ethnicity + " ")
	}

	// Physical features
	if appearance.HairColor != "" || appearance.HairStyle != "" {
		sb.WriteString("with ")
		if appearance.HairColor != "" {
			sb.WriteString(appearance.HairColor + " ")
		}
		if appearance.HairStyle != "" {
			sb.WriteString(appearance.HairStyle + " ")
		}
		sb.WriteString("hair, ")
	}

	if appearance.EyeColor != "" {
		sb.WriteString(appearance.EyeColor + " eyes, ")
	}

	// Photo type context
	switch photoType {
	case "selfie":
		sb.WriteString("taking a selfie, looking at camera, smartphone selfie angle, ")
	case "portrait":
		sb.WriteString("portrait photo, looking at camera, soft lighting, ")
	case "full_body":
		sb.WriteString("full body shot, standing pose, ")
	case "candid":
		sb.WriteString("candid photo, natural moment, ")
	case "flirty":
		sb.WriteString("flirty expression, playful pose, looking at camera seductively, ")
	case "cute":
		sb.WriteString("cute pose, sweet smile, adorable expression, ")
	case "romantic":
		sb.WriteString("romantic mood, soft gaze, intimate feeling, ")
	default:
		sb.WriteString("natural pose, ")
	}

	// Additional context
	if context != "" {
		sb.WriteString(context + ", ")
	}

	// Style
	if appearance.Style != "" {
		sb.WriteString("wearing " + appearance.Style + ", ")
	}

	// Quality tags
	sb.WriteString("highly detailed, professional photography, 8k, beautiful lighting, sharp focus, photorealistic")

	return sb.String()
}

// GenerateImage generates an image using FAL.ai
func (s *FalService) GenerateImage(prompt string, negativePrompt string) (*FalResponse, error) {
	if !s.IsConfigured() {
		return nil, fmt.Errorf("FAL API key not configured")
	}

	if negativePrompt == "" {
		negativePrompt = "ugly, deformed, noisy, blurry, low quality, distorted, disfigured, bad anatomy, bad proportions, extra limbs, mutation, text, watermark"
	}

	reqBody := FalRequest{
		Prompt:         prompt,
		NegativePrompt: negativePrompt,
		ImageSize:      "square_hd",
		NumImages:      1,
		EnableSafeMode: true,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", s.baseURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Key "+s.apiKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check if queued
	if resp.StatusCode == 200 {
		var falResp FalResponse
		if err := json.Unmarshal(body, &falResp); err != nil {
			return nil, fmt.Errorf("failed to unmarshal response: %w, body: %s", err, string(body))
		}
		return &falResp, nil
	}

	// Handle queue response
	if resp.StatusCode == 202 {
		var queueResp FalQueueResponse
		if err := json.Unmarshal(body, &queueResp); err != nil {
			return nil, fmt.Errorf("failed to unmarshal queue response: %w", err)
		}

		// Poll for result
		return s.pollForResult(queueResp.RequestID)
	}

	return nil, fmt.Errorf("FAL API error: status %d, body: %s", resp.StatusCode, string(body))
}

// pollForResult polls the FAL.ai API for the result of a queued request
func (s *FalService) pollForResult(requestID string) (*FalResponse, error) {
	statusURL := fmt.Sprintf("https://queue.fal.run/fal-ai/flux/schnell/requests/%s/status", requestID)
	resultURL := fmt.Sprintf("https://queue.fal.run/fal-ai/flux/schnell/requests/%s", requestID)

	maxAttempts := 30
	for i := 0; i < maxAttempts; i++ {
		time.Sleep(1 * time.Second)

		req, err := http.NewRequest("GET", statusURL, nil)
		if err != nil {
			return nil, err
		}
		req.Header.Set("Authorization", "Key "+s.apiKey)

		resp, err := s.httpClient.Do(req)
		if err != nil {
			continue
		}

		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		var status FalStatusResponse
		if err := json.Unmarshal(body, &status); err != nil {
			continue
		}

		if status.Status == "COMPLETED" {
			// Fetch the actual result
			req, err := http.NewRequest("GET", resultURL, nil)
			if err != nil {
				return nil, err
			}
			req.Header.Set("Authorization", "Key "+s.apiKey)

			resp, err := s.httpClient.Do(req)
			if err != nil {
				return nil, err
			}

			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()

			var falResp FalResponse
			if err := json.Unmarshal(body, &falResp); err != nil {
				return nil, fmt.Errorf("failed to unmarshal result: %w", err)
			}
			return &falResp, nil
		}

		if status.Status == "FAILED" {
			return nil, fmt.Errorf("image generation failed: %s", status.Error)
		}
	}

	return nil, fmt.Errorf("timeout waiting for image generation")
}

// GenerateCompanionPhoto generates a photo for a companion based on context
func (s *FalService) GenerateCompanionPhoto(appearance CompanionAppearance, context string, photoType string) (string, error) {
	prompt := s.BuildImagePrompt(appearance, context, photoType)

	resp, err := s.GenerateImage(prompt, "")
	if err != nil {
		return "", err
	}

	if len(resp.Images) == 0 {
		return "", fmt.Errorf("no images generated")
	}

	return resp.Images[0].URL, nil
}
