import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Document, DocumentType } from '../models/document.model';
import { 
  IDocumentService, 
  CreateDocumentRequest, 
  UpdateDocumentRequest, 
  DocumentQueryOptions 
} from '../types';
import { GameSystemService } from './game-system.service';
import { LockService } from './lock.service';
import { FileStorageService } from './file-storage.service';
import { ValidationService } from './validation.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class DocumentService implements IDocumentService {
  private documents: Map<string, Document> = new Map();

  constructor(
    private gameSystemService: GameSystemService,
    private lockService: LockService,
    private fileStorageService: FileStorageService,
    private validationService: ValidationService
  ) {}

  async findByGameSystem(gameSystemId: string, options: DocumentQueryOptions = {}): Promise<Document[]> {
    const gameSystem = await this.gameSystemService.findById(gameSystemId);
    if (!gameSystem) {
      throw new NotFoundException('Game system not found');
    }

    let documents = Array.from(this.documents.values()).filter(
      doc => doc.gameSystemId === gameSystemId && doc.isActive
    );

    // Apply filters
    if (options.type) {
      documents = documents.filter(doc => doc.type === options.type);
    }

    if (options.tags && options.tags.length > 0) {
      documents = documents.filter(doc => 
        options.tags!.some(tag => doc.tags.includes(tag))
      );
    }

    return documents;
  }

  async findById(id: string): Promise<Document | null> {
    const document = this.documents.get(id);
    return document && document.isActive ? document : null;
  }

  async create(gameSystemId: string, data: CreateDocumentRequest, userId: string): Promise<Document> {
    const gameSystem = await this.gameSystemService.findById(gameSystemId);
    if (!gameSystem) {
      throw new NotFoundException('Game system not found');
    }

    // Check if system is locked by another user
    const lock = await this.lockService.getLock(gameSystemId);
    if (lock && lock.lockedBy !== userId) {
      throw new ConflictException('Game system is currently locked by another user');
    }

    // Check for duplicate display names in the same system
    const existingDocument = Array.from(this.documents.values()).find(
      doc => doc.gameSystemId === gameSystemId && 
             doc.displayName === data.displayName && 
             doc.isActive
    );

    if (existingDocument) {
      throw new ConflictException('A document with this name already exists in the system');
    }

    // Determine document type based on file extension
    const fileExtension = data.file.originalname.split('.').pop()?.toLowerCase();
    let documentType: DocumentType;
    let mimeType: string;

    switch (fileExtension) {
      case 'json':
        documentType = DocumentType.JSON;
        mimeType = 'application/json';
        break;
      case 'pdf':
        documentType = DocumentType.PDF;
        mimeType = 'application/pdf';
        break;
      case 'md':
      case 'markdown':
        documentType = DocumentType.MARKDOWN;
        mimeType = 'text/markdown';
        break;
      default:
        throw new ConflictException('Unsupported file type. Only JSON, PDF, and Markdown files are allowed.');
    }

    // Validate JSON files
    let validationErrors: string[] = [];
    if (documentType === DocumentType.JSON) {
      try {
        const jsonContent = data.file.buffer.toString('utf8');
        JSON.parse(jsonContent); // Validate JSON syntax
        
        // Validate against schema if available
        if (gameSystem.validationSchema) {
          validationErrors = await this.validationService.validateJson(
            JSON.parse(jsonContent), 
            gameSystem.validationSchema
          );
        }
      } catch (error) {
        throw new ConflictException('Invalid JSON format');
      }
    }

    // Store file
    const filePath = await this.fileStorageService.storeFile(
      data.file.buffer, 
      data.file.originalname, 
      gameSystemId
    );

    // Generate checksum
    const checksum = crypto.createHash('sha256').update(data.file.buffer).digest('hex');

    // Create document
    const document = new Document();
    document.id = uuidv4();
    document.gameSystemId = gameSystemId;
    document.filename = data.file.originalname;
    document.displayName = data.displayName;
    document.type = documentType;
    document.filePath = filePath;
    document.fileSize = data.file.size;
    document.mimeType = mimeType;
    document.uploadedBy = userId;
    document.checksum = checksum;
    document.validationErrors = validationErrors;
    document.tags = data.tags || [];
    document.version = 1;
    document.isActive = true;

    this.documents.set(document.id, document);

    return document;
  }

  async update(id: string, data: UpdateDocumentRequest, userId: string): Promise<Document> {
    const document = await this.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if system is locked by another user
    const lock = await this.lockService.getLock(document.gameSystemId);
    if (lock && lock.lockedBy !== userId) {
      throw new ConflictException('Game system is currently locked by another user');
    }

    // Check for name conflicts if display name is being updated
    if (data.displayName && data.displayName !== document.displayName) {
      const existingDocument = Array.from(this.documents.values()).find(
        doc => doc.gameSystemId === document.gameSystemId && 
               doc.displayName === data.displayName && 
               doc.isActive &&
               doc.id !== id
      );

      if (existingDocument) {
        throw new ConflictException('A document with this name already exists in the system');
      }
    }

    // Update fields
    if (data.displayName !== undefined) document.displayName = data.displayName;
    if (data.tags !== undefined) document.tags = data.tags;
    
    document.updatedAt = new Date();

    this.documents.set(id, document);

    return document;
  }

  async delete(id: string, userId: string): Promise<void> {
    const document = await this.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if system is locked by another user
    const lock = await this.lockService.getLock(document.gameSystemId);
    if (lock && lock.lockedBy !== userId) {
      throw new ConflictException('Game system is currently locked by another user');
    }

    // Mark as inactive (soft delete)
    document.isActive = false;
    document.updatedAt = new Date();

    this.documents.set(id, document);

    // Clean up file storage
    try {
      await this.fileStorageService.deleteFile(document.filePath);
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to delete file:', error);
    }
  }

  async getFileContent(id: string): Promise<Buffer> {
    const document = await this.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return await this.fileStorageService.getFile(document.filePath);
  }

  // Helper method to get document with relationships
  async getDocumentWithRelations(id: string): Promise<Document & { gameSystem?: any; uploader?: any; previousVersions?: Document[] } | null> {
    const document = await this.findById(id);
    if (!document) {
      return null;
    }

    // Get related data
  const gameSystem = await this.gameSystemService.findById(document.gameSystemId);
    
    // Get previous versions (would be implemented with proper versioning)
    const previousVersions = Array.from(this.documents.values()).filter(
      doc => doc.gameSystemId === document.gameSystemId &&
             doc.displayName === document.displayName &&
             doc.version < document.version &&
             !doc.isActive
    );

    return {
      ...document,
      gameSystem: gameSystem ?? undefined,
      previousVersions,
    };
  }
}