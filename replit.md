# Subway Runner 3D - Replit.md

## Overview

Subway Runner 3D is a browser-based 3D endless runner game built with React Three Fiber and TypeScript. The game features a player character running through a subway environment, dodging obstacles and collecting coins while the game speed progressively increases. The application follows a full-stack architecture with a React frontend, Express.js backend, and PostgreSQL database integration using Drizzle ORM.

## System Architecture

The application uses a monorepo structure with clear separation between client, server, and shared code:

### Directory Structure
- `client/` - React frontend with Three.js 3D game engine
- `server/` - Express.js backend API
- `shared/` - Common TypeScript types and database schema
- `migrations/` - Database migration files

### Technology Stack
- **Frontend**: React 18, TypeScript, React Three Fiber, Three.js, Tailwind CSS
- **Backend**: Express.js, TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tools**: Vite, ESBuild
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: Zustand with middleware
- **Audio**: HTML5 Audio API

## Key Components

### Frontend Architecture
The frontend is built as a Single Page Application using React Three Fiber for 3D rendering:

- **Game Engine**: React Three Fiber provides the 3D canvas and rendering pipeline
- **Game Loop**: useFrame hooks manage game state updates and animations
- **Input System**: KeyboardControls from @react-three/drei handles player input
- **State Management**: Zustand stores manage game state, audio, and UI state
- **UI System**: Radix UI components provide accessible interface elements

### Backend Architecture
The backend follows a minimal Express.js pattern:

- **Routing**: Centralized route registration in `server/routes.ts`
- **Storage Layer**: Abstract storage interface with in-memory implementation
- **Development Server**: Vite integration for hot module replacement
- **Production Build**: ESBuild bundles the server for deployment

### 3D Game Components
- **GameScene**: Main 3D scene container with lighting and fog
- **Player**: Character controller with physics and input handling
- **Track**: Infinite scrolling subway environment with textures
- **Obstacles**: Dynamic obstacle generation and collision detection
- **Collectibles**: Coin and powerup spawning system
- **Camera**: Third-person follow camera with smooth interpolation

## Data Flow

### Game State Flow
1. Game starts in "menu" state with UI overlay
2. Player input transitions to "playing" state
3. Game loop updates player position, obstacles, and collectibles
4. Collision detection triggers game over or score updates
5. Game can restart back to menu state

### Player Movement
1. Keyboard input captured by KeyboardControls
2. Input events update targetLane in player state
3. useFrame hook interpolates player position toward target
4. Physics system handles vertical movement (jumping/falling)
5. Collision system checks for obstacles and collectibles

### Content Generation
1. Track segments generate procedurally as player advances
2. Obstacles spawn at random positions within lanes
3. Collectibles distributed throughout the track
4. Game speed increases over time for difficulty progression

## External Dependencies

### Core Libraries
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Helper components and utilities for R3F
- **three**: 3D graphics library
- **@tanstack/react-query**: Server state management
- **zustand**: Client state management
- **drizzle-orm**: Type-safe SQL ORM
- **@neondatabase/serverless**: PostgreSQL database driver

### UI and Styling
- **@radix-ui/react-***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant utilities
- **clsx**: Conditional class names

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- Vite dev server provides hot module replacement
- Express server runs with tsx for TypeScript execution
- Database can be provisioned locally or use remote PostgreSQL

### Production Build
1. Vite builds the client into `dist/public/`
2. ESBuild bundles the server into `dist/index.js`
3. Static files served from Express in production mode
4. Database requires DATABASE_URL environment variable

### Database Setup
- Drizzle configuration targets PostgreSQL dialect
- Schema defined in `shared/schema.ts` for type safety
- Migrations generated in `./migrations` directory
- Push command available for schema synchronization

## Changelog

```
Changelog:
- June 28, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```