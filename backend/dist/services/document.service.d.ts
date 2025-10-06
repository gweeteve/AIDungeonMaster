import { Document } from '../models/document.model';
import { IDocumentService, CreateDocumentRequest, UpdateDocumentRequest, DocumentQueryOptions } from '../types';
import { GameSystemService } from './game-system.service';
import { LockService } from './lock.service';
import { FileStorageService } from './file-storage.service';
import { ValidationService } from './validation.service';
export declare class DocumentService implements IDocumentService {
    private gameSystemService;
    private lockService;
    private fileStorageService;
    private validationService;
    private documents;
    constructor(gameSystemService: GameSystemService, lockService: LockService, fileStorageService: FileStorageService, validationService: ValidationService);
    findByGameSystem(gameSystemId: string, options?: DocumentQueryOptions): Promise<Document[]>;
    findById(id: string): Promise<Document | null>;
    create(gameSystemId: string, data: CreateDocumentRequest, userId: string): Promise<Document>;
    update(id: string, data: UpdateDocumentRequest, userId: string): Promise<Document>;
    delete(id: string, userId: string): Promise<void>;
    getFileContent(id: string): Promise<Buffer>;
    getDocumentWithRelations(id: string): Promise<Document & {
        gameSystem?: any;
        uploader?: any;
        previousVersions?: Document[];
    } | null>;
}
