// Game System Types for Frontend
export interface GameSystem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  ownerId: string;
  parentSystemId?: string;
  validationSchema?: object;
  isPublic: boolean;
  editLockUserId?: string;
  editLockExpiresAt?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  syncWithParent: boolean;
  // Populated relationships
  documents?: Document[];
  derivedSystems?: GameSystem[];
  parentSystem?: GameSystem;
}

export interface CreateGameSystemRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  parentSystemId?: string;
  syncWithParent?: boolean;
  validationSchema?: object;
}

export interface UpdateGameSystemRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  syncWithParent?: boolean;
  validationSchema?: object;
}

export interface GameSystemQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  ownerId?: string;
}

export interface EditLock {
  gameSystemId: string;
  lockedBy: string;
  expiresAt: string; // ISO date string
  acquiredAt: string; // ISO date string
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedGameSystemsResponse {
  data: GameSystem[];
  pagination: Pagination;
}

// UI State Types
export interface GameSystemCardProps {
  gameSystem: GameSystem;
  onEdit?: (gameSystem: GameSystem) => void;
  onDelete?: (gameSystem: GameSystem) => void;
  onDerive?: (gameSystem: GameSystem) => void;
  isSelected?: boolean;
}

export interface GameSystemListProps {
  gameSystems: GameSystem[];
  loading?: boolean;
  onGameSystemSelect?: (gameSystem: GameSystem) => void;
  onCreateNew?: () => void;
}

export interface CreateGameSystemFormProps {
  onSubmit: (data: CreateGameSystemRequest) => Promise<void>;
  onCancel: () => void;
  parentSystem?: GameSystem; // For derivation
  loading?: boolean;
}

export interface EditGameSystemFormProps {
  gameSystem: GameSystem;
  onSubmit: (data: UpdateGameSystemRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// Form validation types
export interface GameSystemFormErrors {
  name?: string;
  description?: string;
  imageUrl?: string;
  validationSchema?: string;
}

// Filter and search types
export interface GameSystemFilters {
  search: string;
  ownerId?: string;
  sortBy: 'name' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

// Lock status UI types
export interface LockStatusProps {
  gameSystem: GameSystem;
  currentUserId: string;
  onAcquireLock?: () => Promise<void>;
  onReleaseLock?: () => Promise<void>;
}

export interface LockIndicatorProps {
  isLocked: boolean;
  lockedBy?: string;
  expiresAt?: string;
  isCurrentUser?: boolean;
}

// Error types
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface ValidationError extends ApiError {
  validationErrors: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}
