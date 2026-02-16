package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// HuggingFaceService handles AI image generation using Hugging Face Inference API
type HuggingFaceService struct {
	apiKey     string
	baseURL    string
	model      string
	httpClient *http.Client
}

// HFImageRequest represents the request body for Hugging Face image generation
type HFImageRequest struct {
	Inputs     string            `json:"inputs"`
	Parameters map[string]any    `json:"parameters,omitempty"`
	Options    map[string]any    `json:"options,omitempty"`
}

// HFErrorResponse represents an error response from Hugging Face
type HFErrorResponse struct {
	Error         string `json:"error"`
	EstimatedTime float64 `json:"estimated_time,omitempty"`
}

// NewHuggingFaceService creates a new Hugging Face image generation service
func NewHuggingFaceService() *HuggingFaceService {
	apiKey := os.Getenv("HUGGINGFACE_API_KEY")
	model := os.Getenv("HUGGINGFACE_MODEL")
	if model == "" {
		model = "stabilityai/stable-diffusion-xl-base-1.0" // Free, high quality
	}

	return &HuggingFaceService{
		apiKey:  apiKey,
		baseURL: "https://router.huggingface.co/hf-inference/models/",
		model:   model,
		httpClient: &http.Client{
			Timeout: 120 * time.Second, // HF can be slow
		},
	}
}

// IsConfigured checks if the Hugging Face service has a valid API key
func (s *HuggingFaceService) IsConfigured() bool {
	return s.apiKey != ""
}

// BuildImagePrompt creates an image generation prompt for a companion
func (s *HuggingFaceService) BuildImagePrompt(appearance CompanionAppearance, context string, photoType string) string {
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
		sb.WriteString("flirty expression, playful pose, looking at camera, ")
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

	// Quality tags for SDXL
	sb.WriteString("highly detailed, professional photography, 8k uhd, beautiful lighting, sharp focus, photorealistic, masterpiece, best quality")

	return sb.String()
}

// GenerateImage generates an image using Hugging Face Inference API
func (s *HuggingFaceService) GenerateImage(prompt string) ([]byte, error) {
	if !s.IsConfigured() {
		return nil, fmt.Errorf("Hugging Face API key not configured")
	}

	reqBody := HFImageRequest{
		Inputs: prompt,
		Parameters: map[string]any{
			"negative_prompt": "ugly, deformed, noisy, blurry, low quality, distorted, disfigured, bad anatomy, bad proportions, extra limbs, mutation, text, watermark, nsfw, nude",
			"num_inference_steps": 30,
			"guidance_scale": 7.5,
		},
		Options: map[string]any{
			"wait_for_model": true,
		},
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	url := s.baseURL + s.model
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)

	// Retry logic for model loading
	maxRetries := 3
	var lastErr error

	for i := 0; i < maxRetries; i++ {
		resp, err := s.httpClient.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("failed to send request: %w", err)
			continue
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			lastErr = fmt.Errorf("failed to read response: %w", err)
			continue
		}

		// Check for error response
		if resp.StatusCode != 200 {
			var errResp HFErrorResponse
			if err := json.Unmarshal(body, &errResp); err == nil {
				if strings.Contains(errResp.Error, "loading") || strings.Contains(errResp.Error, "currently loading") {
					// Model is loading, wait and retry
					waitTime := time.Duration(errResp.EstimatedTime) * time.Second
					if waitTime < 10*time.Second {
						waitTime = 10 * time.Second
					}
					if waitTime > 60*time.Second {
						waitTime = 60 * time.Second
					}
					time.Sleep(waitTime)
					continue
				}
				lastErr = fmt.Errorf("Hugging Face API error: %s", errResp.Error)
				continue
			}
			lastErr = fmt.Errorf("Hugging Face API error: status %d, body: %s", resp.StatusCode, string(body))
			continue
		}

		// Success - return image bytes
		return body, nil
	}

	return nil, lastErr
}

// GenerateCompanionPhoto generates a photo for a companion and returns a data URL
func (s *HuggingFaceService) GenerateCompanionPhoto(appearance CompanionAppearance, context string, photoType string) (string, error) {
	prompt := s.BuildImagePrompt(appearance, context, photoType)

	imageBytes, err := s.GenerateImage(prompt)
	if err != nil {
		return "", err
	}

	// Convert to base64 data URL
	// Note: HF returns raw image bytes (usually PNG or JPEG)
	// We'll encode as base64 data URL for frontend display
	encoded := fmt.Sprintf("data:image/png;base64,%s",
		base64Encode(imageBytes))

	return encoded, nil
}

// base64Encode encodes bytes to base64 string
func base64Encode(data []byte) string {
	return base64.StdEncoding.EncodeToString(data)
}
