package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	return router
}

func TestHealthEndpoint(t *testing.T) {
	router := setupTestRouter()
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest("GET", "/api/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var response map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response["status"] != "ok" {
		t.Errorf("Expected status 'ok', got '%s'", response["status"])
	}
}

func TestRegisterValidation(t *testing.T) {
	router := setupTestRouter()

	// Mock register endpoint for validation testing
	router.POST("/api/auth/register", func(c *gin.Context) {
		var req struct {
			Email    string `json:"email" binding:"required,email"`
			Username string `json:"username" binding:"required,min=3,max=50"`
			Password string `json:"password" binding:"required,min=6"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "valid"})
	})

	tests := []struct {
		name       string
		body       map[string]string
		wantStatus int
	}{
		{
			name: "Valid registration",
			body: map[string]string{
				"email":    "test@example.com",
				"username": "testuser",
				"password": "password123",
			},
			wantStatus: http.StatusOK,
		},
		{
			name: "Invalid email",
			body: map[string]string{
				"email":    "invalid-email",
				"username": "testuser",
				"password": "password123",
			},
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "Short username",
			body: map[string]string{
				"email":    "test@example.com",
				"username": "ab",
				"password": "password123",
			},
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "Short password",
			body: map[string]string{
				"email":    "test@example.com",
				"username": "testuser",
				"password": "12345",
			},
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "Missing fields",
			body:       map[string]string{},
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.body)
			req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("Expected status %d, got %d", tt.wantStatus, w.Code)
			}
		})
	}
}

func TestMoodValidation(t *testing.T) {
	router := setupTestRouter()

	// Mock mood endpoint for validation testing
	router.POST("/api/moods", func(c *gin.Context) {
		var req struct {
			MoodType string `json:"moodType" binding:"required,oneof=calm romantic playful deep"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"moodType": req.MoodType})
	})

	tests := []struct {
		name       string
		moodType   string
		wantStatus int
	}{
		{"Valid calm", "calm", http.StatusOK},
		{"Valid romantic", "romantic", http.StatusOK},
		{"Valid playful", "playful", http.StatusOK},
		{"Valid deep", "deep", http.StatusOK},
		{"Invalid mood", "angry", http.StatusBadRequest},
		{"Empty mood", "", http.StatusBadRequest},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(map[string]string{"moodType": tt.moodType})
			req, _ := http.NewRequest("POST", "/api/moods", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("Expected status %d, got %d", tt.wantStatus, w.Code)
			}
		})
	}
}

func TestCompanionCategoryValidation(t *testing.T) {
	router := setupTestRouter()

	// Mock companion creation endpoint
	router.POST("/api/companions/custom", func(c *gin.Context) {
		var req struct {
			Name     string `json:"name" binding:"required"`
			Category string `json:"category" binding:"required,oneof=girls guys anime"`
			Age      int    `json:"age" binding:"required,min=18,max=100"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"name": req.Name, "category": req.Category})
	})

	tests := []struct {
		name       string
		body       map[string]interface{}
		wantStatus int
	}{
		{
			name: "Valid girls category",
			body: map[string]interface{}{
				"name":     "Luna",
				"category": "girls",
				"age":      22,
			},
			wantStatus: http.StatusOK,
		},
		{
			name: "Valid guys category",
			body: map[string]interface{}{
				"name":     "Kai",
				"category": "guys",
				"age":      25,
			},
			wantStatus: http.StatusOK,
		},
		{
			name: "Valid anime category",
			body: map[string]interface{}{
				"name":     "Sakura",
				"category": "anime",
				"age":      20,
			},
			wantStatus: http.StatusOK,
		},
		{
			name: "Invalid category",
			body: map[string]interface{}{
				"name":     "Test",
				"category": "other",
				"age":      22,
			},
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "Age too young",
			body: map[string]interface{}{
				"name":     "Test",
				"category": "girls",
				"age":      17,
			},
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.body)
			req, _ := http.NewRequest("POST", "/api/companions/custom", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("Expected status %d, got %d", tt.wantStatus, w.Code)
			}
		})
	}
}
