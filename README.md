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
- [Engineering Writeup](#engineering-writeup)

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
  - Auto-advance (5 seconds for images, video duration for videos)
  - Tap navigation (left/right sides)
  - Swipe between companions
  - **Video support** with mute/unmute controls
  - Mixture of photos and videos across 35+ story posts

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

---

## Engineering Writeup

### Competitors Studied

Before building this application, I researched several AI companion platforms:

1. **Nectar AI** - The primary reference for this project. Key observations:
   - Clean, mobile-first UI with focus on companion cards
   - Instagram-style stories feature for engagement
   - Personality-based AI interactions
   - Mood-aware conversations

2. **Character.AI** - Studied their conversation flow and character creation
   - Multi-turn conversation handling
   - Character personality persistence

3. **Replika** - Analyzed their companion customization approach
   - Emotional connection features
   - Memory and relationship progression

4. **Instagram Stories** - For the Stories UX implementation
   - Progress bar behavior
   - Tap-to-navigate interaction patterns
   - Auto-advance timing

### UI Design Decisions

**Why this design approach:**

1. **Mobile-First Design**: The target audience primarily uses mobile devices for intimate companion interactions. The bottom navigation, swipe gestures, and full-screen stories all prioritize mobile UX while remaining functional on desktop.

2. **Pink/Gradient Theme**: Romantic and warm colors (pink, rose, coral) create an emotional atmosphere that aligns with the companion concept. The gradient effects add modern polish without being distracting.

3. **Card-Based Layouts**: Companion cards with avatar, name, and tags allow quick scanning and selection. This pattern is familiar from dating apps, making the UX intuitive.

4. **Full-Screen Stories**: Following Instagram's proven pattern for immersive content consumption. The overlay approach with progress bars, tap zones, and swipe navigation creates an engaging experience.

5. **Streaming Chat**: Word-by-word streaming creates the illusion of real-time typing, making the AI feel more human and present.

### Product Feature Decisions

**Core Feature: Stories**
- Implemented full Instagram-style functionality with progress bars, tap navigation, and auto-advance
- Added video support with mute/unmute controls for richer content
- Stories expire after 24 hours to create urgency and encourage return visits

**Net-New Feature 1: Memory Timeline**
- **Why:** Memory is crucial for relationship building. Users want to feel their interactions matter and persist over time.
- **Implementation:** Visual timeline grouped by date, showing chat sessions and story views
- **User Value:** Creates emotional investment by showing relationship history

**Net-New Feature 2: AI Mood Mode**
- **Why:** Different users want different experiences at different times. A romantic mood at night, playful during breaks.
- **Implementation:** Four distinct moods (Calm, Romantic, Playful, Deep) that modify AI system prompts and UI theming
- **User Value:** Personalization that adapts to the user's emotional state

### Architecture Decisions

**Why PostgreSQL:**
- **ACID Compliance**: Chat messages and user data require transactional integrity
- **JSON Support**: JSONB columns for flexible companion personality/appearance data without schema migrations
- **Indexing**: Full index support for efficient queries on conversation history and story retrieval
- **Scalability**: Proven to scale with proper indexing and connection pooling
- **AWS RDS**: Managed service reduces operational overhead, automated backups

**Why Go for Backend:**
- **Performance**: Compiled language with excellent concurrency for handling many simultaneous chat sessions
- **Memory Efficiency**: Lower resource usage than Node.js, important for cost-effective hosting
- **Gin Framework**: Mature, fast HTTP framework with middleware support

**Why Next.js App Router:**
- **Server Components**: Reduced client-side JavaScript, faster initial loads
- **API Routes**: Built-in serverless functions for the streaming endpoint
- **Edge Runtime**: Streaming responses without timeout limitations

### Scalability Considerations

1. **Database Indexing**
   - All foreign keys indexed
   - Compound indexes on frequent query patterns (session_id + companion_id)
   - Stories indexed by companion_id for fast retrieval

2. **Stateless Backend**
   - JWT tokens for authentication (no server-side sessions)
   - Horizontal scaling ready - any instance can handle any request

3. **Connection Pooling**
   - Go backend uses connection pool (25 max, 5 idle)
   - Prevents database connection exhaustion under load

4. **AI Provider Fallback Chain**
   - Primary: Anthropic Claude
   - Secondary: Groq
   - Tertiary: Pattern-based fallback
   - Ensures reliability even during API outages

5. **Session-Based Public Chat**
   - Allows demo usage without authentication
   - Session IDs enable conversation persistence without user accounts

### Challenges and Debugging

1. **Chat Double-Reload Issue**
   - **Problem**: Messages reloaded twice when sending, causing duplicates
   - **Debugging**: Used React DevTools to trace useEffect dependencies
   - **Solution**: Removed `messages` from useEffect dependencies, used refs for one-time history loading

2. **Streaming Response Timing**
   - **Problem**: SSE responses sometimes arrived out of order
   - **Debugging**: Added logging to track chunk sequence
   - **Solution**: Implemented proper buffering in the frontend with word-by-word display

3. **Video Stories Duration**
   - **Problem**: Videos didn't auto-advance at the right time
   - **Debugging**: Checked video element events
   - **Solution**: Used `onLoadedMetadata` to get video duration, `onEnded` for advancement

4. **CORS Issues**
   - **Problem**: Frontend couldn't reach backend after deployment
   - **Debugging**: Browser console showed CORS errors
   - **Solution**: Added proper ALLOWED_ORIGINS configuration with both Vercel and localhost

---

## License

MIT License

---

Built with Next.js, Go, and Anthropic Claude
