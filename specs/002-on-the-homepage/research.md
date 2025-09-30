# Research: Homepage World Management Interface

## Technology Decisions

### Frontend Framework
- **Decision**: Next.js 14 with React 18
- **Rationale**: Already established in project, provides SSR/SSG capabilities for better performance, excellent TypeScript support
- **Alternatives considered**: Pure React, Remix, SvelteKit

### UI Component Library  
- **Decision**: Radix UI with shadcn/ui + Tailwind CSS
- **Rationale**: Already integrated in project, provides accessible primitives, highly customizable, follows constitutional requirement for modern UI/UX
- **Alternatives considered**: Material-UI, Chakra UI, Ant Design

### State Management
- **Decision**: TanStack Query (React Query) for server state
- **Rationale**: Already present in dependencies, excellent for data fetching, caching, background updates crucial for real-time world status
- **Alternatives considered**: Redux Toolkit, Zustand, SWR

### Backend Framework
- **Decision**: NestJS 11 with Express
- **Rationale**: Already established, excellent TypeScript support, modular architecture aligns with constitutional requirements
- **Alternatives considered**: Express.js, Fastify, Koa

### Database Integration
- **Decision**: LiteDB through existing patterns
- **Rationale**: Constitutional requirement, lightweight, file-based, suitable for desktop application scenario
- **Alternatives considered**: SQLite, PostgreSQL, MongoDB

### Image Loading Strategy
- **Decision**: Progressive loading with fallbacks
- **Rationale**: User clarification specifies background loading with game system defaults, improves perceived performance
- **Alternatives considered**: Lazy loading only, Placeholder-first approach

### API Design Patterns
- **Decision**: RESTful APIs with consistent resource naming
- **Rationale**: Simple, predictable, easier for AI agents to consume (constitutional AI-first requirement)
- **Alternatives considered**: GraphQL, tRPC

## Architecture Patterns

### Component Architecture
- **Decision**: Compound component pattern for world cards
- **Rationale**: Reusable, testable, follows React best practices, supports different world display modes
- **Implementation**: WorldCard.Root, WorldCard.Image, WorldCard.Title, WorldCard.Actions

### Error Handling
- **Decision**: Error boundaries with fallback UI
- **Rationale**: Graceful degradation for failed image loads, network errors, maintains user experience
- **Implementation**: React Error Boundaries + Toast notifications

### Performance Optimization
- **Decision**: Image optimization with Next.js Image component
- **Rationale**: Automatic optimization, lazy loading, WebP support, improves constitutional performance requirements
- **Implementation**: next/image with custom loader for external URLs

## Integration Patterns

### File Organization
- **Decision**: Feature-based directory structure
- **Rationale**: Easier maintenance, clear separation of concerns, supports modular development
- **Structure**: components/homepage/, components/worlds/, components/game-systems/

### API Communication
- **Decision**: Custom hooks with TanStack Query
- **Rationale**: Encapsulates data fetching logic, provides caching, loading states, error handling
- **Implementation**: useWorlds(), useGameSystems(), useCreateWorld()

### Type Safety
- **Decision**: Shared TypeScript types between frontend/backend
- **Rationale**: Constitutional TypeScript-first requirement, prevents runtime errors, improves DX
- **Implementation**: Common types in backend exported for frontend consumption