package db

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

// Initialize creates a new database connection
func Initialize() (*sql.DB, error) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Build connection string from individual parts
		host := getEnv("DB_HOST", "localhost")
		port := getEnv("DB_PORT", "5432")
		user := getEnv("DB_USER", "postgres")
		password := getEnv("DB_PASSWORD", "postgres")
		dbName := getEnv("DB_NAME", "nectar_ai")
		sslMode := getEnv("DB_SSLMODE", "disable")

		dbURL = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			host, port, user, password, dbName, sslMode,
		)
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	return db, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// RunMigrations runs all database migrations
func RunMigrations(db *sql.DB) error {
	migrations := []string{
		// Users table
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email VARCHAR(255) UNIQUE NOT NULL,
			username VARCHAR(50) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			avatar_url TEXT,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)`,

		// Companions table
		`CREATE TABLE IF NOT EXISTS companions (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(100) NOT NULL,
			category VARCHAR(20) NOT NULL CHECK (category IN ('girls', 'guys', 'anime')),
			bio TEXT,
			avatar_url TEXT NOT NULL,
			personality_json JSONB DEFAULT '{}',
			tags TEXT[] DEFAULT '{}',
			age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
			status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline')),
			style VARCHAR(20) DEFAULT 'realistic' CHECK (style IN ('realistic', 'anime')),
			scenario TEXT,
			greeting TEXT,
			appearance_json JSONB DEFAULT '{}',
			interests TEXT[] DEFAULT '{}',
			communication_style VARCHAR(50) DEFAULT 'friendly',
			gallery_urls TEXT[] DEFAULT '{}',
			is_featured BOOLEAN DEFAULT false,
			message_count INTEGER DEFAULT 0,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)`,

		// Stories table
		`CREATE TABLE IF NOT EXISTS stories (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			companion_id UUID NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
			media_url TEXT NOT NULL,
			media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
			caption TEXT,
			order_index INTEGER DEFAULT 0,
			expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)`,

		// Story views table
		`CREATE TABLE IF NOT EXISTS story_views (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(story_id, user_id)
		)`,

		// Conversations table
		`CREATE TABLE IF NOT EXISTS conversations (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			companion_id UUID NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(user_id, companion_id)
		)`,

		// Messages table
		`CREATE TABLE IF NOT EXISTS messages (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
			sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'ai')),
			content TEXT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)`,

		// Memories table
		`CREATE TABLE IF NOT EXISTS memories (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			companion_id UUID NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
			event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('chat', 'story_view', 'milestone', 'mood_change')),
			metadata JSONB DEFAULT '{}',
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)`,

		// Moods table
		`CREATE TABLE IF NOT EXISTS moods (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			mood_type VARCHAR(20) NOT NULL CHECK (mood_type IN ('calm', 'romantic', 'playful', 'deep')),
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)`,

		// Public conversations table (for demo without auth)
		`CREATE TABLE IF NOT EXISTS public_conversations (
			id TEXT PRIMARY KEY,
			session_id TEXT NOT NULL,
			companion_id TEXT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(session_id, companion_id)
		)`,

		// Public messages table (for demo without auth)
		`CREATE TABLE IF NOT EXISTS public_messages (
			id TEXT PRIMARY KEY,
			conversation_id TEXT NOT NULL REFERENCES public_conversations(id) ON DELETE CASCADE,
			sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'ai')),
			content TEXT NOT NULL,
			image_url TEXT,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)`,

		// Indexes
		`CREATE INDEX IF NOT EXISTS idx_stories_companion_id ON stories(companion_id)`,
		`CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON story_views(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`,
		`CREATE INDEX IF NOT EXISTS idx_conversations_user_companion ON conversations(user_id, companion_id)`,
		`CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_public_conversations_session ON public_conversations(session_id)`,
		`CREATE INDEX IF NOT EXISTS idx_public_messages_conversation ON public_messages(conversation_id)`,
	}

	for _, migration := range migrations {
		if _, err := db.Exec(migration); err != nil {
			return fmt.Errorf("failed to run migration: %w\nSQL: %s", err, migration)
		}
	}

	return nil
}
