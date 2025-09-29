# Data Model: Game System Management Interface

## Core Entities

### GameSystem
Represents a complete RPG rule set that can be used in gaming sessions.

**Fields**:
- `id`: string (UUID) - Unique identifier
- `name`: string - Display name (e.g., "D&D 5E Homebrew")
- `description`: string (optional) - Brief description of the system
- `imageUrl`: string (optional) - URL to system image, falls back to default
- `ownerId`: string - ID of user who created the system
- `parentSystemId`: string (optional) - ID of system this was derived from
- `validationSchema`: object (optional) - JSON Schema for validating uploaded JSON documents
- `isPublic`: boolean - Whether system is visible to all users (for collaborative editing)
- `editLockUserId`: string (optional) - ID of user currently editing (null when unlocked)
- `editLockExpiresAt`: Date (optional) - When the edit lock expires
- `createdAt`: Date - Creation timestamp
- `updatedAt`: Date - Last modification timestamp
- `syncWithParent`: boolean - Whether to sync changes from parent system (for derived systems)

**Relationships**:
- `documents`: Document[] - All documents belonging to this system
- `derivedSystems`: GameSystem[] - Systems derived from this one
- `parentSystem`: GameSystem (optional) - System this was derived from
- `owner`: User - User who created the system
- `sessions`: Session[] - Gaming sessions using this system

**Validation Rules**:
- `name` must be 1-100 characters, unique per user
- `description` max 500 characters
- `imageUrl` must be valid URL format if provided
- `validationSchema` must be valid JSON Schema v7 if provided
- `editLockExpiresAt` must be future date if lock is active
- `parentSystemId` cannot create circular references

**State Transitions**:
- Created → Unlocked (default state)
- Unlocked → Locked (when user starts editing)
- Locked → Unlocked (when edit session ends or lock expires)
- Active → Archived (when system deleted, preserves references)

### Document
Individual files containing game rules, stats, or content.

**Fields**:
- `id`: string (UUID) - Unique identifier
- `gameSystemId`: string - ID of owning game system
- `filename`: string - Original uploaded filename
- `displayName`: string - User-friendly name for the document
- `type`: DocumentType - ENUM: JSON, PDF, MARKDOWN
- `filePath`: string - Server file system path
- `fileSize`: number - Size in bytes
- `mimeType`: string - MIME type from upload
- `uploadedBy`: string - ID of user who uploaded
- `checksum`: string - SHA-256 hash for integrity
- `validationErrors`: string[] - JSON validation errors (empty if valid)
- `tags`: string[] - User-defined tags for organization
- `version`: number - Document version number (incremented on updates)
- `isActive`: boolean - Whether document is current version
- `createdAt`: Date - Upload timestamp
- `updatedAt`: Date - Last modification timestamp

**Relationships**:
- `gameSystem`: GameSystem - Owning game system
- `uploader`: User - User who uploaded the document
- `previousVersions`: Document[] - Earlier versions of this document

**Validation Rules**:
- `filename` must be valid filename, max 255 characters
- `displayName` must be 1-100 characters
- `fileSize` must be positive integer
- `checksum` must be valid SHA-256 hash
- `version` must be positive integer, auto-incremented
- Only one document can be active per (gameSystemId, displayName) combination

### User
Person who creates and manages game systems.

**Fields**:
- `id`: string (UUID) - Unique identifier
- `username`: string - Unique username for display
- `email`: string - Email address for authentication
- `displayName`: string - Full name or preferred display name
- `avatarUrl`: string (optional) - Profile picture URL
- `isActive`: boolean - Whether account is active
- `preferences`: UserPreferences - User settings and preferences
- `createdAt`: Date - Account creation timestamp
- `lastLoginAt`: Date (optional) - Last login timestamp

**Relationships**:
- `ownedSystems`: GameSystem[] - Game systems created by this user
- `uploadedDocuments`: Document[] - Documents uploaded by this user
- `activeSessions`: Session[] - Gaming sessions where user is participant

**Validation Rules**:
- `username` must be 3-30 characters, alphanumeric + underscore, unique
- `email` must be valid email format, unique
- `displayName` must be 1-100 characters

### UserPreferences
User-specific settings and preferences.

**Fields**:
- `userId`: string - ID of owning user
- `defaultImageUrl`: string (optional) - Default image for new systems
- `theme`: string - UI theme preference ("light", "dark", "auto")
- `autoLockTimeout`: number - Minutes before edit lock expires (default: 30)
- `notificationSettings`: NotificationSettings - Notification preferences
- `updatedAt`: Date - Last preference update

### NotificationSettings
User notification preferences.

**Fields**:
- `editLockNotifications`: boolean - Notify when system becomes locked/unlocked
- `systemUpdateNotifications`: boolean - Notify when derived systems are updated
- `sessionInviteNotifications`: boolean - Notify when invited to sessions

### Session
Gaming sessions that use a specific game system (referenced for future integration).

**Fields**:
- `id`: string (UUID) - Unique identifier
- `name`: string - Session name
- `gameSystemId`: string - ID of game system being used
- `dmUserId`: string - ID of Dungeon Master
- `status`: SessionStatus - ENUM: PLANNING, ACTIVE, PAUSED, COMPLETED
- `createdAt`: Date - Session creation timestamp

**Relationships**:
- `gameSystem`: GameSystem - Game system being used
- `dungeonMaster`: User - User running the session

## Derived Types

### DocumentType
```typescript
enum DocumentType {
  JSON = "JSON",
  PDF = "PDF", 
  MARKDOWN = "MARKDOWN"
}
```

### SessionStatus
```typescript
enum SessionStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE", 
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED"
}
```

## Index Strategy

### Primary Indexes
- GameSystem: `id`, `ownerId`, `parentSystemId`
- Document: `id`, `gameSystemId`, `uploadedBy`
- User: `id`, `username`, `email`

### Secondary Indexes
- GameSystem: `name`, `isPublic`, `createdAt`
- Document: `type`, `displayName`, `isActive`, `createdAt`
- User: `isActive`, `lastLoginAt`

### Composite Indexes
- GameSystem: `(ownerId, name)` for uniqueness validation
- Document: `(gameSystemId, displayName, isActive)` for active document lookup
- Document: `(gameSystemId, type)` for filtering by document type

## Data Integrity Rules

### Referential Integrity
- Documents cannot exist without valid GameSystem
- GameSystem derivation cannot create cycles
- Edit locks must have valid expiration dates
- Document versions must be sequential

### Business Rules
- Only one user can edit a GameSystem at a time
- Derived systems inherit parent's validation schema by default
- Document names must be unique within a GameSystem
- Users can only delete systems they own (collaborative editing affects edit permissions only)

### Cascade Rules
- When GameSystem is deleted: Mark as archived, preserve Document references
- When User is deleted: Transfer GameSystem ownership or mark orphaned
- When Document is replaced: Archive previous version, maintain history

## Migration Considerations

### Version 1.0 → 1.1 (Future)
- Add role-based permissions for finer access control
- Add system templates for common RPG systems
- Add collaborative editing features beyond simple locking

### Version 1.1 → 1.2 (Future)
- Add full-text search across document contents
- Add system rating and review capabilities
- Add import/export functionality for system backups