// Document Types for Frontend
export interface Document {
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
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Populated relationships
  gameSystem?: GameSystem;
  uploader?: User;
  previousVersions?: Document[];
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

export interface CreateDocumentRequest {
  file: File;
  displayName: string;
  tags?: string[];
}

export interface UpdateDocumentRequest {
  displayName?: string;
  tags?: string[];
}

export interface DocumentQueryOptions {
  type?: 'JSON' | 'PDF' | 'MARKDOWN';
  tags?: string[];
}

// References to avoid circular dependencies
interface GameSystem {
  id: string;
  name: string;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

// UI Component Props
export interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onView?: (document: Document) => void;
  showGameSystem?: boolean;
}

export interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  onDocumentSelect?: (document: Document) => void;
  onUploadNew?: () => void;
  showGameSystem?: boolean;
}

export interface DocumentUploadProps {
  gameSystemId: string;
  onSubmit: (data: CreateDocumentRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

export interface DocumentEditFormProps {
  document: Document;
  onSubmit: (data: UpdateDocumentRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// File upload types
export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Document viewer types
export interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
  canEdit?: boolean;
  onEdit?: () => void;
}

export interface JsonViewerProps {
  content: object;
  validationErrors?: string[];
  showErrors?: boolean;
}

export interface MarkdownViewerProps {
  content: string;
  enableCodeHighlight?: boolean;
}

// Filter and search types
export interface DocumentFilters {
  search: string;
  type?: 'JSON' | 'PDF' | 'MARKDOWN';
  tags: string[];
  sortBy: 'displayName' | 'createdAt' | 'updatedAt' | 'fileSize';
  sortOrder: 'asc' | 'desc';
}

// Tag management types
export interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
}

export interface TagSuggestion {
  value: string;
  count: number;
  category?: string;
}

// Validation types
export interface DocumentFormErrors {
  displayName?: string;
  file?: string;
  tags?: string;
}

export interface DocumentValidationStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  schema?: object;
}

// File type definitions
export const SUPPORTED_FILE_TYPES: Record<
  Document['type'],
  {
    extensions: string[];
    mimeTypes: string[];
    icon: string;
    color: string;
  }
> = {
  JSON: {
    extensions: ['.json'],
    mimeTypes: ['application/json'],
    icon: 'FileJson',
    color: 'text-blue-600',
  },
  PDF: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    icon: 'FileText',
    color: 'text-red-600',
  },
  MARKDOWN: {
    extensions: ['.md', '.markdown'],
    mimeTypes: ['text/markdown', 'text/x-markdown'],
    icon: 'FileText',
    color: 'text-green-600',
  },
};

// Utility functions types
export interface FileTypeInfo {
  type: 'JSON' | 'PDF' | 'MARKDOWN';
  extensions: string[];
  mimeTypes: string[];
  icon: string;
  color: string;
}

export interface DocumentStats {
  totalDocuments: number;
  documentsByType: Record<'JSON' | 'PDF' | 'MARKDOWN', number>;
  totalSize: number;
  averageSize: number;
  validDocuments: number;
  invalidDocuments: number;
}

// Download and export types
export interface DownloadOptions {
  format?: 'original' | 'json' | 'pdf';
  includeMetadata?: boolean;
  compress?: boolean;
}

export interface BulkDownloadRequest {
  documentIds: string[];
  options: DownloadOptions;
}

export interface ExportRequest {
  gameSystemId: string;
  includeDocuments: boolean;
  includeMetadata: boolean;
  format: 'zip' | 'tar';
}
