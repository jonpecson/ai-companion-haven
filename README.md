# Nectar AI Companion

**Live Demo:** https://ai-companion-haven.vercel.app

A full-stack AI Companion web application built for the Nectar.ai Full Stack Engineer take-home assessment. This application provides AI companions with Instagram-style Stories, real-time chat, and two original net-new features: **Memory Timeline** and **AI Mood Mode**.

![AI Companion Haven](https://ai-companion-haven.vercel.app/images/companions/mia.jpg)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Original Features](#original-features)
- [Competitor Analysis](#competitor-analysis)
- [Design Decisions](#design-decisions)
- [Scalability](#scalability)
- [Challenges & Solutions](#challenges--solutions)

## Features

### Core Features
- **11 AI Companions**: Browse and interact with diverse companions across 3 categories:
  - **Girls** (4): Mia Chen, Sofia Martinez, Emma Laurent, Aria Rose
  - **Guys** (4): Alex Rivera, Ryan Kim, Atlas Monroe, Kai Nakamura
  - **Anime** (3): Sakura Tanaka, Luna Nightshade, Nova Valentine
- **Instagram-style Stories**: Full-screen story viewer with:
  - Progress bars showing story position
  - Auto-advance (5 seconds per story)
  - Tap navigation (left/right sides)
  - Swipe between companions
  - 35+ story posts across companions
- **Real-time Chat**: Mood-aware AI responses with:
  - Typing indicators
  - Photo request detection ("send me a selfie")
  - Dynamic image generation
  - Conversation sidebar
- **Companion Creator**: Multi-step wizard with:
  - Personality trait sliders
  - Tag selection
  - Avatar upload
  - Category selection

### Original Features (Net-New)

#### 1. Memory Timeline (`/memories`)
Visual chronological timeline of user-companion interactions:
- Chat sessions with timestamps
- Story views
- Milestone achievements
- Mood changes
- Grouped by date (Today, Yesterday, etc.)
- Animated entrance with Framer Motion
- Desktop sidebar with stats

#### 2. AI Mood Mode (`/mood`)
User-selectable mood that transforms the entire chat experience:

| Mood | Emoji | Theme | AI Response Style |
|------|-------|-------|-------------------|
| Calm | 🧘 | Blue/Teal | Peaceful, meditative |
| Romantic | 💕 | Pink/Rose | Sweet, heartfelt |
| Playful | 🎉 | Orange/Yellow | Fun, energetic |
| Deep | 🌌 | Purple/Indigo | Philosophical |

- Real-time UI theme adaptation
- Mood passed to AI for response selection
- Persistent across sessions

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State**: Zustand
- **Components**: Radix UI primitives

### Backend
- **Language**: Go (Golang)
- **Framework**: Gin
- **Real-time**: Gorilla WebSockets
- **Auth**: JWT (golang-jwt)

### Database
- **PostgreSQL** (recommended: Supabase or CockroachDB)
- **Why PostgreSQL?**:
  - JSONB support for flexible personality storage
  - Robust indexing for scalable queries
  - Array types for companion tags
  - Strong consistency for chat messages

### Deployment
- **Frontend**: Vercel
- **Backend**: Fly.io
- **Database**: Supabase/CockroachDB

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                        │
│              (App Router + Server Components)               │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST + WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Go API Layer                           │
│          Gin Framework + Gorilla WebSockets                 │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│ │    Auth     │ │   Services   │ │      WebSocket Hub     │ │
│ │  (JWT)      │ │   (AI, DB)   │ │   (Real-time Chat)     │ │
│ └─────────────┘ └──────────────┘ └────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                             │
│    Users, Companions, Stories, Messages, Memories, Moods    │
└─────────────────────────────────────────────────────────────┘
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
cp .env.local.example .env.local

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

# Run migrations and seed data
psql -d your_database -f migrations/seed.sql

# Run the server
go run cmd/server/main.go
```

### Environment Variables

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

**Backend (.env)**
```
PORT=8080
DATABASE_URL=postgres://user:pass@localhost:5432/nectar_ai
JWT_SECRET=your-secret-key
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── companions/        # Companion listing & detail
│   ├── chat/              # Real-time chat interface
│   ├── stories/           # Stories viewer
│   ├── memories/          # Memory timeline (custom feature)
│   ├── mood/              # AI Mood Mode (custom feature)
│   └── create/            # Companion creator
├── components/
│   ├── ui/                # Base UI components
│   ├── chat/              # Chat-specific components
│   ├── stories/           # Story viewer components
│   └── companions/        # Companion cards
├── lib/
│   ├── api.ts             # API client
│   ├── store.ts           # Zustand store
│   └── websocket.ts       # WebSocket client
├── types/                  # TypeScript definitions
├── backend/
│   ├── cmd/server/        # Application entry point
│   └── internal/
│       ├── api/           # HTTP handlers & routes
│       ├── services/      # Business logic (AI, Auth)
│       ├── models/        # Data models
│       ├── db/            # Database layer
│       └── websocket/     # WebSocket hub
└── migrations/            # SQL migrations & seed data
```

## API Documentation

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new user |
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/me` | GET | Get current user |

### Companions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/companions` | GET | List companions (paginated) |
| `/api/companions/:id` | GET | Get companion details |
| `/api/companions/custom` | POST | Create custom companion |

### Stories
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stories` | GET | List all stories |
| `/api/stories/:companionId` | GET | Get companion's stories |
| `/api/stories/view` | POST | Mark story as viewed |

### Chat
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/start` | POST | Start conversation |
| `/api/chat/message` | POST | Send message |
| `/api/chat/history/:companionId` | GET | Get chat history |
| `/ws/chat/:conversationId` | WS | Real-time chat |

### Memories (Custom Feature)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/memories` | GET | Get user's memory timeline |

### Moods (Custom Feature)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/moods` | POST | Set user's mood |
| `/api/moods` | GET | Get current mood |

## Database Schema

### Tables
- **users**: User accounts
- **companions**: AI companion profiles with personality JSON
- **stories**: Companion stories with media
- **story_views**: Track viewed stories per user
- **conversations**: User-companion chat sessions
- **messages**: Chat messages
- **memories**: Interaction timeline events
- **moods**: User mood preferences

### Key Indexes
- `stories(companion_id)` - Fast story retrieval
- `messages(conversation_id)` - Chat pagination
- `conversations(user_id, companion_id)` - Session lookup
- `story_views(user_id)` - Viewed status

## Original Features

### 1. Memory Timeline (`/memories`)

A chronological timeline of all user interactions:
- Chat sessions with duration
- Story views
- Milestone achievements (streaks, message counts)
- Mood changes

**Implementation**:
- Events stored in `memories` table with JSONB metadata
- Grouped by date for timeline display
- Framer Motion animations for smooth scrolling
- Icon mapping based on event type

### 2. AI Mood Mode (`/mood`)

Customizable mood that affects the entire chat experience:
- **Calm**: Peaceful, meditative responses
- **Romantic**: Sweet, heartfelt messages
- **Playful**: Fun, energetic interactions
- **Deep**: Philosophical discussions

**Implementation**:
- Mood stored per user in `moods` table
- Chat UI theme adapts (gradient backgrounds)
- AI response pool selected based on mood
- Persistent across sessions

## Competitor Analysis

### Detailed Competitor Study

| Feature | Nectar.ai | Replika | Character.AI | Anima | This Project |
|---------|-----------|---------|--------------|-------|--------------|
| Stories | Yes | No | No | No | **Yes** |
| Mood Selection | Limited | Yes | No | Yes | **Yes (4 modes)** |
| Memory Timeline | No | Basic | No | Basic | **Yes (Full)** |
| Photo Generation | Yes | Limited | No | Yes | **Yes** |
| Custom Companions | Yes | Limited | Yes | Yes | **Yes** |
| WebSocket Chat | Yes | Yes | Yes | Yes | **Yes** |
| Mobile-First | Yes | Yes | No | Yes | **Yes** |

### Studied Competitors

#### 1. **Nectar.ai** (Target Product)
- **Strengths**: Beautiful UI, stories feature, high-quality images, immersive experience
- **What I Borrowed**: Story format, gradient aesthetics, personality sliders, category filtering
- **What I Improved**: Added mood-aware chat theming, comprehensive memory timeline

#### 2. **Replika**
- **Strengths**: Strong emotional connection, memory of past conversations
- **What I Borrowed**: Conversation continuity concept, relationship building mechanics
- **What I Improved**: Visual memory timeline vs. invisible context

#### 3. **Character.AI**
- **Strengths**: Diverse personas, creative conversations
- **What I Borrowed**: Personality trait customization
- **What I Improved**: Added visual stories for deeper engagement

#### 4. **Anima**
- **Strengths**: Mood tracking, relationship levels
- **What I Borrowed**: Mood affects conversation style
- **What I Improved**: Visual mood selection UI with real-time theme changes

### Key Insights Applied

1. **Stories Create Emotional Connection**: Unlike chat-only apps, stories make companions feel like they have lives outside conversations
2. **Mood Awareness = Authenticity**: Users want control over conversation tone without explicit instructions
3. **Visual History Builds Investment**: Seeing a timeline of interactions creates emotional attachment
4. **Mobile-First is Non-Negotiable**: 80%+ of users access on mobile devices

## Design Decisions

### Why Next.js App Router?
- Server components for faster initial load
- Built-in image optimization
- Simplified routing with file-based structure
- Better SEO for public pages

### Why Go for Backend?
- Excellent WebSocket support (gorilla/websocket)
- Fast compile times for rapid iteration
- Simple concurrency model for real-time features
- Low memory footprint for deployment

### Why Zustand over Redux/Context?
- Minimal boilerplate
- Works well with server components
- Simple subscription model
- Easy to test

### UI/UX Philosophy
- **Mobile-first**: Bottom navigation, touch-friendly
- **Dark theme**: Matches competitor aesthetics
- **Glassmorphism**: Modern, subtle visual style
- **Micro-animations**: Framer Motion for polish

## Scalability

### Current Capacity
- Designed for 10,000+ concurrent users
- Paginated endpoints (20-50 items per page)
- Indexed queries for sub-100ms responses

### Scaling Strategies
1. **Database**: Connection pooling, read replicas
2. **WebSockets**: Hub pattern with goroutine pooling
3. **Caching**: Redis for session/mood caching (future)
4. **CDN**: Media assets via CloudFront/Cloudflare

### Performance Optimizations
- `JSONB` for flexible schema without joins
- Composite indexes on frequent queries
- WebSocket message batching
- Next.js image optimization

## Challenges & Solutions

### Challenge 1: Real-time Chat Synchronization
**Problem**: Ensuring messages appear in order across WebSocket and REST

**Solution**: Hybrid approach - REST for sending (guaranteed delivery), WebSocket for AI responses (real-time feel). Timestamps for ordering.

### Challenge 2: Story View State
**Problem**: Tracking viewed status per user without excessive queries

**Solution**: `story_views` junction table with unique constraint. Single query with EXISTS subquery for view status.

### Challenge 3: Mood-Aware Responses
**Problem**: Making AI responses feel contextually appropriate

**Solution**: Response pools organized by mood type. AI service selects from appropriate pool based on user's current mood setting.

### Challenge 4: Mobile Performance
**Problem**: Heavy animations on mobile devices

**Solution**: Reduced motion for mobile, lazy-loaded images, optimized Framer Motion animations with `layoutId` for transitions.

## Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
npm run test
```

## Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (Fly.io)
```bash
cd backend
fly deploy
```

## License

MIT License

---

Built with care for the Nectar.ai engineering team.
