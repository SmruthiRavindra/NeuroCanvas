# NeuroCanvas - Emotion-Aware Creative Companion

## Overview

NeuroCanvas is an emotion-aware AI creative companion that helps users express themselves through art, music, and poetry based on their real-time mood. The application analyzes emotional cues from voice input and text to personalize creative experiences, adapting the interface and suggestions to match the user's emotional state.

**Core Features:**
- Voice-based mood detection (calm, energetic, sad, anxious)
- AI-powered creative suggestions for art, music, and poetry
- Mood-responsive UI themes and color palettes
- Personal journal for tracking emotional patterns
- Weekly mood analytics and insights
- Community sharing platform
- Hobby discovery with AI-powered recommendations
- Multi-API key management with automatic quota rotation

**Technology Stack:**
- Frontend: React with TypeScript, Vite, Wouter (routing)
- UI Framework: shadcn/ui components with Radix UI primitives
- Styling: Tailwind CSS with custom mood-based theming
- Backend: Express.js with TypeScript
- AI Integration: Google Gemini AI for mood analysis and creative suggestions
- Database: PostgreSQL with Drizzle ORM
- State Management: React Context API (MoodContext)

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 8, 2025:**
- Implemented multi-API key management system to overcome Gemini's 50 requests/day quota limitation
  - Added database schema for storing multiple API keys per user
  - Created Settings page UI for adding, viewing, and deleting API keys
  - Implemented automatic key rotation when quota limits are reached
  - API keys are masked in the UI for security (shows first 10 and last 4 characters only)
  - System tries user's API keys first, then falls back to environment variable
  - Added Settings link to profile dropdown menu in navbar

**Previous Changes:**
- Reverted UI color scheme from muted lavender/beige back to original vibrant design with saturated purples, blues, and greens
- Implemented user logout functionality with dropdown menu accessible from avatar icon in navbar

## System Architecture

### Frontend Architecture

**Component Structure:**
- **Page Components:** Simple wrapper components that compose layout (Navbar) with feature components
- **Feature Components:** Self-contained UI modules (CreativeCanvas, Journal, Community, WeeklyMoodOverview, DiscoverHobbies, MoodDetectionLanding)
- **UI Components:** Reusable shadcn/ui components in `client/src/components/ui/`
- **Layout:** Navbar navigation with mood-aware visual feedback

**Routing Strategy:**
- Client-side routing using Wouter library
- Routes defined in `App.tsx`: home (/), canvas, journal, overview, community, discover
- 404 handling with NotFound component

**State Management:**
- Global mood state managed via MoodContext (React Context API)
- Mood values: 'calm' | 'energetic' | 'sad' | 'anxious' | null
- Confidence score tracking for mood detection accuracy
- Context provider wraps entire application to enable mood-aware features

**Styling System:**
- Tailwind CSS with extensive custom configuration
- Mood-based CSS variables that adapt based on `data-mood` attribute on root element
- Custom design tokens for spacing, colors, shadows, and typography
- Responsive design with mobile-first approach
- Font stack: Inter (UI/body) and Poppins (display/headlines)
- Color palettes dynamically mapped to each mood state

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Development mode with hot reloading via tsx
- Production build using esbuild for server bundle
- Vite integration for client-side development

**API Endpoints:**
- `POST /api/analyze-mood` - Accepts text input, returns mood analysis with confidence score
- `POST /api/creative-suggestions` - Generates creative content suggestions based on mood and mode (art/music/poetry)
- `POST /api/hobby-chat` - Interactive chat about hobbies with mood-aware responses

**Mood Analysis Logic:**
- Text-based emotion detection using Gemini AI
- Structured JSON responses with mood classification, confidence, and reasoning
- Fallback to random mood selection if AI analysis fails
- Response schema validation for consistent data structure

**Session Management:**
- In-memory user storage (MemStorage implementation)
- User authentication schema defined but not fully implemented
- Session persistence using connect-pg-simple (configured for PostgreSQL)

### Data Architecture

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database queries
- WebSocket connection for real-time capabilities
- Schema location: `shared/schema.ts`

**Current Schema:**
- `users` table with id, username, password fields
- UUID-based primary keys
- Zod validation schemas for insert operations

**Storage Pattern:**
- Abstracted storage interface (IStorage) for potential future database implementations
- Current implementation uses in-memory storage (MemStorage)
- Designed to be swapped with database-backed storage without changing application logic

**Data Flow:**
- Client requests mood analysis via API
- Server processes with Gemini AI
- Mood state stored in React Context
- UI components react to mood changes via context consumers

### AI Integration Architecture

**Gemini AI Integration:**
- Google GenAI SDK (@google/genai)
- Model: gemini-2.0-flash-exp
- JSON-based responses with schema validation
- System prompts engineered for consistent emotion detection

**Use Cases:**
1. **Mood Analysis:** Text/voice input → emotional state classification
2. **Creative Suggestions:** Mood + creative mode → personalized recommendations
3. **Hobby Guidance:** Interactive AI chat about hobby learning paths

**Error Handling:**
- Graceful fallbacks when AI service is unavailable
- Logging of AI errors for debugging
- Default responses to maintain user experience

### Build & Development

**Development Setup:**
- Vite dev server with HMR
- TypeScript type checking (no emit)
- ESNext module system
- Path aliases: `@/` (client), `@shared/`, `@assets/`

**Build Process:**
- Client: Vite build to `dist/public`
- Server: esbuild bundle to `dist/index.js`
- Platform: Node.js with ESM format
- External packages not bundled (using node_modules)

**Configuration Files:**
- `vite.config.ts` - Vite configuration with React plugin and aliases
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.ts` - Tailwind theming and color system
- `drizzle.config.ts` - Database migrations configuration

## External Dependencies

**AI Services:**
- Google Gemini AI (gemini-2.0-flash-exp model)
- API key required via `GEMINI_API_KEY` environment variable
- Used for mood analysis and creative content generation

**Database:**
- PostgreSQL via Neon serverless platform
- Connection via `DATABASE_URL` environment variable
- WebSocket support for real-time features

**Third-Party Libraries:**
- **UI Framework:** Radix UI primitives for accessible components
- **Styling:** Tailwind CSS with PostCSS and Autoprefixer
- **Charts:** Recharts for mood visualization
- **Date Handling:** date-fns for date formatting
- **Forms:** React Hook Form with Zod validation
- **Query Management:** TanStack React Query
- **Icons:** Lucide React

**Development Tools:**
- Replit-specific plugins for runtime error overlay and dev banner
- ESBuild for server bundling
- Drizzle Kit for database migrations

**Session Storage:**
- connect-pg-simple for PostgreSQL-backed sessions (configured but may not be fully active)

**Asset Management:**
- Static images stored in `attached_assets/generated_images/`
- Referenced via Vite alias `@assets/`