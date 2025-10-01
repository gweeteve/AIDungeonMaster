import { Response } from 'express';
import { DocumentService } from '../services/document.service';
import { UpdateDocumentRequest, DocumentQueryOptions, RequestWithUser } from '../types';
import { Document } from '../models/document.model';
export declare class DocumentsController {
    private readonly documentService;
    constructor(documentService: DocumentService);
    findByGameSystem(gameSystemId: string, query: DocumentQueryOptions): Promise<Document[]>;
    upload(gameSystemId: string, file: Express.Multer.File, displayName: string, tags: string, req: RequestWithUser): Promise<Document>;
    findOne(id: string): Promise<any>;
    update(id: string, updateRequest: UpdateDocumentRequest, req: RequestWithUser): Promise<Document>;
    remove(id: string, req: RequestWithUser): Promise<void>;
    download(id: string, res: Response): Promise<void>;
}
