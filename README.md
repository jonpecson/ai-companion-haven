# Nectar AI Companion

**Live Demo:** https://ai-companion-haven.vercel.app

A full-stack AI Companion web application featuring AI-powered conversations with Anthropic Claude, Instagram-style Stories, real-time streaming chat, and personalized companion interactions.

![AI Companion Haven](https://ai-companion-haven.vercel.app/images/companions/mia.jpg)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Third-Party Services](#third-party-services)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)

## Features

### Frontend Features

#### AI Chat
- **Real-time Streaming Responses**: Messages appear word-by-word with typing animation using Server-Sent Events (SSE)
- **Anthropic Claude Integration**: AI responses powered by Claude 3 Haiku/Sonnet with personality-aware prompts
- **Conversation History**: Persistent chat history stored in database, synced across sessions
- **Mood-Aware Chat**: AI adapts responses based on user's selected mood (Calm, Romantic, Playful, Deep)
- **Photo Descriptions**: When users request photos, companions describe personalized photos matching their personality
- **Emoji Picker**: Built-in emoji picker for expressive conversations
- **Image Sharing**: Upload and share images in chat with preview

#### Companions
- **11 AI Companions** across 3 categories:
  - **Girls** (4): Mia Chen, Sofia Martinez, Emma Laurent, Aria Rose
  - **Guys** (4): Alex Rivera, Ryan Kim, Atlas Monroe, Kai Nakamura
  - **Anime** (3): Sakura Tanaka, Luna Nightshade, Nova Valentine
- **Detailed Profiles**: Personality traits, bio, interests, and tags
- **Search & Filter**: Search companions by name or tags, filter by category

#### Stories
- **Instagram-style Stories**: Full-screen story viewer with:
  - Progress bars showing story position
  - Auto-advance (5 seconds per story)
  - Tap navigation (left/right sides)
  - Swipe between companions
  - 35+ story posts across companions

#### Companion Creator
- **5-Step Wizard**: Create custom companions with:
  - Basic info (name, age, bio)
  - Category selection (Girls, Guys, Anime)
  - Personality trait sliders (Friendliness, Humor, Intelligence, Romantic, Flirty)
  - Interest tag selection
  - Avatar selection from AI-generated images

#### Memory Timeline (`/memories`)
- Visual chronological timeline of interactions
- Chat sessions with timestamps
- Story views tracking
- Grouped by date (Today, Yesterday, etc.)
- Animated entrance with Framer Motion

#### AI Mood Mode (`/mood`)
- User-selectable mood that transforms chat experience:

| Mood | Theme | AI Response Style |
|------|-------|-------------------|
| Calm 🧘 | Blue/Teal | Peaceful, meditative |
| Romantic 💕 | Pink/Rose | Sweet, heartfelt |
| Playful 🎉 | Orange/Yellow | Fun, energetic |
| Deep 🌌 | Purple/Indigo | Philosophical |

#### Progressive Web App (PWA)
- Installable on mobile devices
- Custom app icon with pink gradient heart
- Offline-ready manifest

### Backend Features

#### AI Services
- **Anthropic Claude Integration**: Primary AI provider with detailed system prompts
- **Groq Fallback**: Secondary AI provider for redundancy
- **Fallback AI Service**: Simple pattern-based responses when APIs unavailable
- **Personality-Aware Prompts**: System prompts built from companion traits, bio, and interests

#### Chat System
- **Public Chat API**: No authentication required for demo
- **Session-based Persistence**: Anonymous users identified by session ID
- **Conversation History**: Messages stored in PostgreSQL
- **Streaming Support**: Real-time response streaming via SSE

#### Authentication
- **JWT Authentication**: Secure token-based auth
- **User Registration/Login**: Full auth flow implemented
- **Protected Routes**: Middleware for authenticated endpoints

#### Database
- **PostgreSQL**: Robust relational database
- **Auto-migrations**: Tables created on startup
- **Companion Seeding**: Pre-populated with 11 companions

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **Zustand** | State management with persistence |
| **Radix UI** | Accessible UI primitives |
| **shadcn/ui** | Pre-built component library |
| **emoji-mart** | Emoji picker component |
| **Sonner** | Toast notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Go 1.21+** | Backend language |
| **Gin** | HTTP web framework |
| **lib/pq** | PostgreSQL driver |
| **golang-jwt** | JWT authentication |

### Database
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary database |
| **AWS RDS** | Managed database hosting |

## Third-Party Services

| Service | Purpose | Environment Variable |
|---------|---------|---------------------|
| **Anthropic Claude** | AI chat responses | `ANTHROPIC_API_KEY` |
| **Groq** | Fallback AI provider | `GROQ_API_KEY` |
| **AWS S3** | Image/media storage | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| **AWS RDS** | PostgreSQL database | `DATABASE_URL` |
| **Vercel** | Frontend hosting | - |
| **Render** | Backend hosting | - |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                        │
│              (App Router + Server Components)               │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Chat UI    │  │   Stories    │  │   Companions     │  │
│  │  (Streaming) │  │   Viewer     │  │   Browser        │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST + SSE
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Go Backend (Gin)                       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│ │    Auth     │ │   Claude AI  │ │      Groq AI           │ │
│ │   (JWT)     │ │   Service    │ │      (Fallback)        │ │
│ └─────────────┘ └──────────────┘ └────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │   AWS S3     │ │  Anthropic   │
│   (AWS RDS)  │ │   (Media)    │ │   Claude API │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Getting Started

### Prerequisites
- Node.js 18+
- Go 1.21+
- PostgreSQL 14+

### Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Install dependencies
go mod download

# Run the server (migrations run automatically)
go run cmd/server/main.go
```

## Environment Variables

### Frontend (.env.local)
```env
# Backend URL for API calls
BACKEND_URL=https://ai-companion-haven.onrender.com

# Public API URL (leave empty to use Next.js API routes)
NEXT_PUBLIC_API_URL=
```

### Backend (.env)
```env
# Server
PORT=8080

# Database
DATABASE_URL=postgres://user:pass@host:5432/nectar_ai
# Or individual variables:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=nectar_ai
DB_SSLMODE=disable

# Authentication
JWT_SECRET=your-secret-key

# AI Services
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-3-haiku-20240307
GROQ_API_KEY=gsk_...

# CORS
ALLOWED_ORIGINS=https://ai-companion-haven.vercel.app,http://localhost:3000
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── companions/        # Companion listing & detail
│   ├── chat/              # Real-time chat interface
│   ├── stories/           # Stories viewer
│   ├── memories/          # Memory timeline
│   ├── mood/              # AI Mood Mode
│   ├── create/            # Companion creator
│   ├── settings/          # User settings
│   ├── icon.tsx           # Dynamic favicon
│   └── api/               # Next.js API routes
│       ├── chat/          # Chat streaming endpoint
│       ├── companions/    # Companion CRUD
│       └── stories/       # Stories API
├── components/
│   ├── ui/                # Base UI components (shadcn)
│   ├── chat/              # Chat components
│   │   ├── ChatInput.tsx  # Message input with emoji
│   │   ├── MessageBubble.tsx
│   │   └── StreamingMessage.tsx
│   ├── stories/           # Story viewer components
│   ├── companions/        # Companion cards
│   └── layout/            # Layout components
│       ├── TopBar.tsx     # Search & navigation
│       └── BottomNav.tsx  # Mobile navigation
├── lib/
│   ├── api.ts             # API client functions
│   ├── store.ts           # Zustand store
│   └── utils.ts           # Utility functions
├── types/                 # TypeScript definitions
├── public/
│   ├── images/            # Static images
│   │   └── companions/    # Companion avatars
│   └── manifest.json      # PWA manifest
└── backend/
    ├── cmd/server/        # Application entry point
    └── internal/
        ├── api/           # HTTP handlers & routes
        │   ├── handlers.go
        │   ├── routes.go
        │   └── middleware.go
        ├── services/      # Business logic
        │   ├── claude.go  # Anthropic Claude service
        │   ├── groq.go    # Groq AI service
        │   ├── ai.go      # Fallback AI service
        │   └── auth.go    # JWT authentication
        ├── models/        # Data models
        └── db/            # Database layer
            └── db.go      # Connection & migrations
```

## API Documentation

### Public Endpoints (No Auth Required)

#### Companions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/companions` | GET | List companions (paginated, filterable) |
| `/api/companions/:id` | GET | Get companion details |
| `/api/companions/custom` | POST | Create custom companion |

#### Chat
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/public` | POST | Send message, get AI response |
| `/api/chat/public/save` | POST | Save messages to database |
| `/api/chat/public/history/:companionId` | GET | Get chat history |
| `/api/chat/public/conversations` | GET | List conversations |

#### Stories
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stories` | GET | List all stories |
| `/api/stories/:companionId` | GET | Get companion's stories |

### Protected Endpoints (Auth Required)

#### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new user |
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/me` | GET | Get current user |

#### Memories
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/memories` | GET | Get user's memory timeline |

#### Moods
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/moods` | POST | Set user's mood |
| `/api/moods` | GET | Get current mood |

### Frontend API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/stream` | POST | Streaming chat responses (SSE) |

## Database Schema

### Tables

```sql
-- Users
users (id, email, username, password_hash, avatar_url, created_at)

-- Companions
companions (id, name, category, bio, avatar_url, personality_json,
           tags[], age, status, style, scenario, greeting,
           appearance_json, interests[], communication_style,
           gallery_urls[], is_featured, message_count, created_at)

-- Stories
stories (id, companion_id, media_url, media_type, caption,
        order_index, expires_at, created_at)

-- Story Views
story_views (id, story_id, user_id, viewed_at)

-- Conversations (authenticated users)
conversations (id, user_id, companion_id, created_at)

-- Messages (authenticated users)
messages (id, conversation_id, sender, content, created_at)

-- Public Conversations (anonymous users)
public_conversations (id, session_id, companion_id, created_at)

-- Public Messages (anonymous users)
public_messages (id, conversation_id, sender, content, image_url, created_at)

-- Memories
memories (id, user_id, companion_id, event_type, metadata, created_at)

-- Moods
moods (id, user_id, mood_type, created_at)
```

### Indexes
- `idx_stories_companion_id` - Fast story retrieval
- `idx_messages_conversation_id` - Chat pagination
- `idx_conversations_user_companion` - Session lookup
- `idx_public_conversations_session` - Public chat lookup
- `idx_public_messages_conversation` - Public message retrieval

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Add environment variables
3. Deploy automatically on push to main

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set environment variables:
   - `ANTHROPIC_API_KEY`
   - `CLAUDE_MODEL`
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS`
4. Deploy automatically on push to main

## Note on Repository Visibility

This repository is **public** because Render's free tier does not support automatic deployments from private GitHub repositories. If you fork this project and want to use Render for backend hosting, you'll need to either:
- Keep the repository public
- Upgrade to Render's paid plan for private repo support
- Use an alternative hosting provider (Railway, Fly.io, etc.)

## License

MIT License

---

Built with ❤️ using Next.js, Go, and Anthropic Claude
