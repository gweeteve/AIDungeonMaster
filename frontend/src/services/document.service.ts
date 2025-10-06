import {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentQueryOptions,
  ApiError,
  SUPPORTED_FILE_TYPES,
  FileTypeInfo,
  DocumentStats,
  FileValidationResult,
} from '@/types/document.types';

class DocumentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(
        errorData.message ?? `HTTP ${response.status}: ${response.statusText}`
      );
    }
    return response.json();
  }

  private getAuthHeaders(): HeadersInit {
    // TODO: Implement proper authentication
    return {
      // 'Authorization': `Bearer ${getAuthToken()}`,
    };
  }

  async getDocumentsByGameSystem(
    gameSystemId: string,
    options: DocumentQueryOptions = {}
  ): Promise<Document[]> {
    const searchParams = new URLSearchParams();

    if (options.type) searchParams.set('type', options.type);
    if (options.tags) {
      options.tags.forEach((tag) => searchParams.append('tags', tag));
    }

    const url = `${this.baseUrl}/api/game-systems/${gameSystemId}/documents?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Document[]>(response);
  }

  async getDocument(id: string): Promise<Document> {
    const response = await fetch(`${this.baseUrl}/api/documents/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Document>(response);
  }

  async uploadDocument(
    gameSystemId: string,
    data: CreateDocumentRequest
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('displayName', data.displayName);

    if (data.tags && data.tags.length > 0) {
      formData.append('tags', data.tags.join(','));
    }

    const response = await fetch(
      `${this.baseUrl}/api/game-systems/${gameSystemId}/documents`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      }
    );

    return this.handleResponse<Document>(response);
  }

  async updateDocument(
    id: string,
    data: UpdateDocumentRequest
  ): Promise<Document> {
    const response = await fetch(`${this.baseUrl}/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse<Document>(response);
  }

  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/documents/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message ?? 'Failed to delete document');
    }
  }

  async downloadDocument(id: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/api/documents/${id}/download`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message ?? 'Failed to download document');
    }

    return response.blob();
  }

  async downloadDocumentAsUrl(id: string): Promise<string> {
    const blob = await this.downloadDocument(id);
    return URL.createObjectURL(blob);
  }

  // File validation methods
  validateFile(file: File): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(
        `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(maxSize)})`
      );
    }

    // Check file type
    const fileType = this.getFileTypeFromFile(file);
    if (!fileType) {
      errors.push(
        `Unsupported file type. Supported types: JSON, PDF, Markdown`
      );
    }

    // Check file name
    if (file.name.length > 255) {
      errors.push('File name is too long (maximum 255 characters)');
    }

    // Additional validations based on file type
    if (fileType?.type === 'JSON') {
      // JSON files should have reasonable size for parsing
      if (file.size > 10 * 1024 * 1024) {
        warnings.push(
          'Large JSON files may take longer to process and validate'
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  validateDisplayName(name: string): string[] {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Display name is required');
    } else if (name.length > 100) {
      errors.push('Display name must be 100 characters or less');
    }

    return errors;
  }

  validateTags(tags: string[]): string[] {
    const errors: string[] = [];

    if (tags.length > 20) {
      errors.push('Maximum 20 tags allowed');
    }

    for (const tag of tags) {
      if (tag.length > 50) {
        errors.push(`Tag "${tag}" is too long (maximum 50 characters)`);
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(tag)) {
        errors.push(
          `Tag "${tag}" contains invalid characters. Use only letters, numbers, hyphens, and underscores`
        );
      }
    }

    return errors;
  }

  // Utility methods
  getFileTypeFromFile(file: File): FileTypeInfo | null {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    for (const [typeName, typeInfo] of Object.entries(SUPPORTED_FILE_TYPES)) {
      if (
        typeInfo.extensions.includes(extension) ||
        typeInfo.mimeTypes.includes(file.type)
      ) {
        return {
          type: typeName as 'JSON' | 'PDF' | 'MARKDOWN',
          ...typeInfo,
        };
      }
    }

    return null;
  }

  getFileTypeFromDocument(document: Document): FileTypeInfo {
    return {
      type: document.type,
      ...SUPPORTED_FILE_TYPES[document.type],
    };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, unitIndex);

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  formatDocumentAge(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  getDocumentStats(documents: Document[]): DocumentStats {
    const stats: DocumentStats = {
      totalDocuments: documents.length,
      documentsByType: { JSON: 0, PDF: 0, MARKDOWN: 0 },
      totalSize: 0,
      averageSize: 0,
      validDocuments: 0,
      invalidDocuments: 0,
    };

    for (const doc of documents) {
      stats.documentsByType[doc.type]++;
      stats.totalSize += doc.fileSize;

      if (doc.validationErrors.length === 0) {
        stats.validDocuments++;
      } else {
        stats.invalidDocuments++;
      }
    }

    stats.averageSize =
      documents.length > 0 ? stats.totalSize / documents.length : 0;

    return stats;
  }

  // Search and filter helpers
  filterDocuments(
    documents: Document[],
    filters: {
      search?: string;
      type?: 'JSON' | 'PDF' | 'MARKDOWN';
      tags?: string[];
      hasErrors?: boolean;
    }
  ): Document[] {
    let filtered = [...documents];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.displayName.toLowerCase().includes(searchLower) ||
          doc.filename.toLowerCase().includes(searchLower) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.type) {
      filtered = filtered.filter((doc) => doc.type === filters.type);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((doc) =>
        filters.tags!.some((tag) => doc.tags.includes(tag))
      );
    }

    if (filters.hasErrors !== undefined) {
      filtered = filtered.filter((doc) =>
        filters.hasErrors
          ? doc.validationErrors.length > 0
          : doc.validationErrors.length === 0
      );
    }

    return filtered;
  }

  sortDocuments(
    documents: Document[],
    sortBy: 'displayName' | 'createdAt' | 'updatedAt' | 'fileSize',
    order: 'asc' | 'desc'
  ): Document[] {
    return [...documents].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'displayName':
          comparison = a.displayName.localeCompare(b.displayName);
          break;
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'fileSize':
          comparison = a.fileSize - b.fileSize;
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });
  }

  getAllTags(documents: Document[]): string[] {
    const allTags = documents.flatMap((doc) => doc.tags);
    return [...new Set(allTags)].sort();
  }

  getTagSuggestions(
    documents: Document[],
    currentTags: string[] = []
  ): string[] {
    const allTags = this.getAllTags(documents);
    return allTags.filter((tag) => !currentTags.includes(tag));
  }
}

// Export singleton instance
export const documentService = new DocumentService();
export default documentService;
