# Data Model: Homepage World Management Interface

## Core Entities

### World
Represents a game session/world that users can create and launch.

**Fields:**
- `id: string` - Unique identifier (UUID)
- `name: string` - User-provided world name (1-255 characters, UTF-8)
- `imageUrl?: string` - Optional custom image URL
- `gameSystemId: string` - Reference to associated game system
- `sessionData?: object` - Game-specific session state
- `lastAccessedAt: Date` - Timestamp of last access (for sorting)
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last modification timestamp

**Validation Rules:**
- name: required, 1-255 characters, UTF-8 support
- imageUrl: optional, valid URL format when provided
- gameSystemId: required, must reference existing game system
- lastAccessedAt: automatically updated on world launch

**Relationships:**
- belongsTo GameSystem (via gameSystemId)

### GameSystem
Represents a tabletop RPG ruleset/framework.

**Fields:**
- `id: string` - Unique identifier (UUID)
- `name: string` - System name (e.g., "D&D 5e", "Pathfinder 2e")
- `defaultImageUrl: string` - Default image for worlds without custom images
- `description?: string` - Optional system description
- `rulesetConfig: object` - Configuration for rules engine
- `isActive: boolean` - Whether system is available for new worlds
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last modification timestamp

**Validation Rules:**
- name: required, unique, 1-100 characters
- defaultImageUrl: required, valid URL format
- rulesetConfig: required, valid JSON object
- isActive: defaults to true

**Relationships:**
- hasMany World

## State Transitions

### World Lifecycle
```
Draft → Active → Archived
  ↓       ↓        ↓
  •   Last Access  •
      Updated
```

**State Rules:**
- Draft: Newly created worlds, not yet launched
- Active: Worlds that have been launched at least once
- Archived: Worlds marked as inactive (future enhancement)

### Image Loading States
```
Loading → Success
   ↓         ↓
Fallback  Displayed
```

**State Rules:**
- Loading: Show game system default image immediately
- Success: Replace with custom image when loaded
- Fallback: Permanent fallback to game system image on error

## Database Schema

### LiteDB Collections

**worlds**
```typescript
interface WorldDocument {
  _id: string;
  name: string;
  imageUrl?: string;
  gameSystemId: string;
  sessionData?: any;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**gameSystems**
```typescript
interface GameSystemDocument {
  _id: string;
  name: string;
  defaultImageUrl: string;
  description?: string;
  rulesetConfig: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Indexes

**Performance Indexes:**
- worlds.lastAccessedAt (desc) - For homepage sorting
- worlds.gameSystemId - For joins with game systems
- gameSystems.isActive - For filtering available systems
- gameSystems.name - For alphabetical sorting in dialogs

## Data Access Patterns

### Homepage Loading
1. Fetch all worlds with lastAccessedAt sort (desc)
2. Join with game systems for default images
3. Return combined world+gameSystem data

### World Creation
1. Validate world name (1-255 chars, UTF-8)
2. Validate game system exists and isActive
3. Validate image URL format (if provided)
4. Set creation timestamps
5. Insert world record

### Image Resolution
1. Frontend: Show game system default immediately
2. Background: Attempt to load custom image
3. On success: Replace default with custom
4. On error: Keep game system default

## Validation Schema

### World Creation Request
```typescript
interface CreateWorldRequest {
  name: string;           // 1-255 chars, UTF-8
  gameSystemId: string;   // Must exist in DB
  imageUrl?: string;      // Valid URL or undefined
}
```

### World Response
```typescript
interface WorldResponse {
  id: string;
  name: string;
  imageUrl?: string;
  gameSystem: {
    id: string;
    name: string;
    defaultImageUrl: string;
  };
  lastAccessedAt: string; // ISO date
  createdAt: string;      // ISO date
}
```