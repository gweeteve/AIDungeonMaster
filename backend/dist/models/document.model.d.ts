import { GameSystem } from './game-system.model';
import { User } from './user.model';
export declare enum DocumentType {
    JSON = "JSON",
    PDF = "PDF",
    MARKDOWN = "MARKDOWN"
}
export declare class Document {
    id: string;
    gameSystemId: string;
    filename: string;
    displayName: string;
    type: DocumentType;
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
    gameSystem?: GameSystem;
    uploader?: User;
    previousVersions?: Document[];
    constructor();
}
