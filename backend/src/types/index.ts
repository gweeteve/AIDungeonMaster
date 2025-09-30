// Core entity interfaces
export interface IGameSystem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  ownerId: string;
  parentSystemId?: string;
  validationSchema?: object;
  isPublic: boolean;
  editLockUserId?: string;
  editLockExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  syncWithParent: boolean;
}

export interface IDocument {
  id: string;
  gameSystemId: string;
  filename: string;
  displayName: string;
  type: 'JSON' | 'PDF' | 'MARKDOWN';
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  checksum: string;
  validationErrors: string[];
  tags: string[];
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Request/Response DTOs
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

export interface CreateDocumentRequest {
  file: Express.Multer.File;
  displayName: string;
  tags?: string[];
}

export interface UpdateDocumentRequest {
  displayName?: string;
  tags?: string[];
}

export interface EditLock {
  gameSystemId: string;
  lockedBy: string;
  expiresAt: Date;
  acquiredAt: Date;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: Date;
}

export interface ValidationError extends ApiError {
  validationErrors: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

// Service interfaces
export interface IGameSystemService {
  findAll(options?: GameSystemQueryOptions): Promise<PaginatedResponse<IGameSystem>>;
  findById(id: string): Promise<IGameSystem | null>;
  create(data: CreateGameSystemRequest, userId: string): Promise<IGameSystem>;
  update(id: string, data: UpdateGameSystemRequest, userId: string): Promise<IGameSystem>;
  delete(id: string, userId: string): Promise<void>;
  acquireLock(id: string, userId: string): Promise<EditLock>;
  releaseLock(id: string, userId: string): Promise<void>;
}

export interface IDocumentService {
  findByGameSystem(gameSystemId: string, options?: DocumentQueryOptions): Promise<IDocument[]>;
  findById(id: string): Promise<IDocument | null>;
  create(gameSystemId: string, data: CreateDocumentRequest, userId: string): Promise<IDocument>;
  update(id: string, data: UpdateDocumentRequest, userId: string): Promise<IDocument>;
  delete(id: string, userId: string): Promise<void>;
  getFileContent(id: string): Promise<Buffer>;
}

export interface GameSystemQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  ownerId?: string;
}

export interface DocumentQueryOptions {
  type?: 'JSON' | 'PDF' | 'MARKDOWN';
  tags?: string[];
}

// Authentication context
export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}