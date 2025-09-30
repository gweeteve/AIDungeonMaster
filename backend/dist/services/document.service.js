"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const document_model_1 = require("../models/document.model");
const game_system_service_1 = require("./game-system.service");
const lock_service_1 = require("./lock.service");
const file_storage_service_1 = require("./file-storage.service");
const validation_service_1 = require("./validation.service");
const uuid_1 = require("uuid");
const crypto = require("crypto");
let DocumentService = class DocumentService {
    constructor(gameSystemService, lockService, fileStorageService, validationService) {
        this.gameSystemService = gameSystemService;
        this.lockService = lockService;
        this.fileStorageService = fileStorageService;
        this.validationService = validationService;
        this.documents = new Map();
    }
    async findByGameSystem(gameSystemId, options = {}) {
        const gameSystem = await this.gameSystemService.findById(gameSystemId);
        if (!gameSystem) {
            throw new common_1.NotFoundException('Game system not found');
        }
        let documents = Array.from(this.documents.values()).filter(doc => doc.gameSystemId === gameSystemId && doc.isActive);
        if (options.type) {
            documents = documents.filter(doc => doc.type === options.type);
        }
        if (options.tags && options.tags.length > 0) {
            documents = documents.filter(doc => options.tags.some(tag => doc.tags.includes(tag)));
        }
        return documents;
    }
    async findById(id) {
        const document = this.documents.get(id);
        return document && document.isActive ? document : null;
    }
    async create(gameSystemId, data, userId) {
        const gameSystem = await this.gameSystemService.findById(gameSystemId);
        if (!gameSystem) {
            throw new common_1.NotFoundException('Game system not found');
        }
        const lock = await this.lockService.getLock(gameSystemId);
        if (lock && lock.lockedBy !== userId) {
            throw new common_1.ConflictException('Game system is currently locked by another user');
        }
        const existingDocument = Array.from(this.documents.values()).find(doc => doc.gameSystemId === gameSystemId &&
            doc.displayName === data.displayName &&
            doc.isActive);
        if (existingDocument) {
            throw new common_1.ConflictException('A document with this name already exists in the system');
        }
        const fileExtension = data.file.originalname.split('.').pop()?.toLowerCase();
        let documentType;
        let mimeType;
        switch (fileExtension) {
            case 'json':
                documentType = document_model_1.DocumentType.JSON;
                mimeType = 'application/json';
                break;
            case 'pdf':
                documentType = document_model_1.DocumentType.PDF;
                mimeType = 'application/pdf';
                break;
            case 'md':
            case 'markdown':
                documentType = document_model_1.DocumentType.MARKDOWN;
                mimeType = 'text/markdown';
                break;
            default:
                throw new common_1.ConflictException('Unsupported file type. Only JSON, PDF, and Markdown files are allowed.');
        }
        let validationErrors = [];
        if (documentType === document_model_1.DocumentType.JSON) {
            try {
                const jsonContent = data.file.buffer.toString('utf8');
                JSON.parse(jsonContent);
                if (gameSystem.validationSchema) {
                    validationErrors = await this.validationService.validateJson(JSON.parse(jsonContent), gameSystem.validationSchema);
                }
            }
            catch (error) {
                throw new common_1.ConflictException('Invalid JSON format');
            }
        }
        const filePath = await this.fileStorageService.storeFile(data.file.buffer, data.file.originalname, gameSystemId);
        const checksum = crypto.createHash('sha256').update(data.file.buffer).digest('hex');
        const document = new document_model_1.Document();
        document.id = (0, uuid_1.v4)();
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
    async update(id, data, userId) {
        const document = await this.findById(id);
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        const lock = await this.lockService.getLock(document.gameSystemId);
        if (lock && lock.lockedBy !== userId) {
            throw new common_1.ConflictException('Game system is currently locked by another user');
        }
        if (data.displayName && data.displayName !== document.displayName) {
            const existingDocument = Array.from(this.documents.values()).find(doc => doc.gameSystemId === document.gameSystemId &&
                doc.displayName === data.displayName &&
                doc.isActive &&
                doc.id !== id);
            if (existingDocument) {
                throw new common_1.ConflictException('A document with this name already exists in the system');
            }
        }
        if (data.displayName !== undefined)
            document.displayName = data.displayName;
        if (data.tags !== undefined)
            document.tags = data.tags;
        document.updatedAt = new Date();
        this.documents.set(id, document);
        return document;
    }
    async delete(id, userId) {
        const document = await this.findById(id);
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        const lock = await this.lockService.getLock(document.gameSystemId);
        if (lock && lock.lockedBy !== userId) {
            throw new common_1.ConflictException('Game system is currently locked by another user');
        }
        document.isActive = false;
        document.updatedAt = new Date();
        this.documents.set(id, document);
        try {
            await this.fileStorageService.deleteFile(document.filePath);
        }
        catch (error) {
            console.error('Failed to delete file:', error);
        }
    }
    async getFileContent(id) {
        const document = await this.findById(id);
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        return await this.fileStorageService.getFile(document.filePath);
    }
    async getDocumentWithRelations(id) {
        const document = await this.findById(id);
        if (!document) {
            return null;
        }
        const gameSystem = await this.gameSystemService.findById(document.gameSystemId);
        const previousVersions = Array.from(this.documents.values()).filter(doc => doc.gameSystemId === document.gameSystemId &&
            doc.displayName === document.displayName &&
            doc.version < document.version &&
            !doc.isActive);
        return {
            ...document,
            gameSystem,
            previousVersions,
        };
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [game_system_service_1.GameSystemService,
        lock_service_1.LockService,
        file_storage_service_1.FileStorageService,
        validation_service_1.ValidationService])
], DocumentService);
//# sourceMappingURL=document.service.js.map