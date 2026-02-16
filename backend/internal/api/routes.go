package api

import (
	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(router *gin.Engine, h *Handlers) {
	api := router.Group("/api")

	// Auth routes (public)
	auth := api.Group("/auth")
	{
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)
		auth.GET("/me", AuthMiddleware(h.authService), h.GetMe)
	}

	// Companions routes (all public for demo)
	companions := api.Group("/companions")
	{
		companions.GET("", h.ListCompanions)
		companions.GET("/:id", h.GetCompanion)
		companions.POST("/custom", h.CreateCompanion) // Public for demo
	}

	// Stories routes (protected)
	stories := api.Group("/stories")
	stories.Use(OptionalAuthMiddleware(h.authService))
	{
		stories.GET("", h.ListStories)
		stories.GET("/:companionId", h.GetStoriesByCompanion)
		stories.POST("/view", AuthMiddleware(h.authService), h.ViewStory)
	}

	// Chat routes (protected)
	chat := api.Group("/chat")
	chat.Use(AuthMiddleware(h.authService))
	{
		chat.POST("/start", h.StartChat)
		chat.POST("/message", h.SendMessage)
		chat.GET("/history/:companionId", h.GetChatHistory)
	}

	// Public chat routes (for demo/testing without auth)
	api.POST("/chat/public", h.PublicChat)
	api.POST("/chat/public/save", h.SavePublicMessage)
	api.GET("/chat/public/history/:companionId", h.GetPublicChatHistory)
	api.GET("/chat/public/conversations", h.GetPublicConversations)

	// Image generation routes (public for demo)
	api.POST("/images/generate", h.GenerateCompanionPhoto)

	// Memories routes (protected)
	memories := api.Group("/memories")
	memories.Use(AuthMiddleware(h.authService))
	{
		memories.GET("", h.ListMemories)
	}

	// Moods routes (protected)
	moods := api.Group("/moods")
	moods.Use(AuthMiddleware(h.authService))
	{
		moods.POST("", h.SetMood)
		moods.GET("", h.GetMood)
	}

	// Health check with version
	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"version": "1.1.0",
			"claude":  h.claudeService.IsConfigured(),
		})
	})
}
