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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const document_service_1 = require("../services/document.service");
let DocumentsController = class DocumentsController {
    constructor(documentService) {
        this.documentService = documentService;
    }
    async findByGameSystem(gameSystemId, query) {
        return await this.documentService.findByGameSystem(gameSystemId, query);
    }
    async upload(gameSystemId, file, displayName, tags, req) {
        if (!file) {
            throw new Error('No file provided');
        }
        if (!displayName) {
            throw new Error('Display name is required');
        }
        const userId = req.user?.id || 'mock-user-id';
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
            }
            catch {
                parsedTags = [];
            }
        }
        const createRequest = {
            file,
            displayName,
            tags: parsedTags,
        };
        return await this.documentService.create(gameSystemId, createRequest, userId);
    }
    async findOne(id) {
        const document = await this.documentService.getDocumentWithRelations(id);
        if (!document) {
            throw new Error('Document not found');
        }
        return document;
    }
    async update(id, updateRequest, req) {
        const userId = req.user?.id || 'mock-user-id';
        return await this.documentService.update(id, updateRequest, userId);
    }
    async remove(id, req) {
        const userId = req.user?.id || 'mock-user-id';
        await this.documentService.delete(id, userId);
    }
    async download(id, res) {
        const document = await this.documentService.findById(id);
        if (!document) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Document not found',
                statusCode: 404,
                timestamp: new Date(),
            });
            return;
        }
        try {
            const fileContent = await this.documentService.getFileContent(id);
            res.setHeader('Content-Type', document.mimeType);
            res.setHeader('Content-Length', fileContent.length);
            res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
            const etag = `"${document.checksum}"`;
            res.setHeader('ETag', etag);
            const clientETag = res.req.headers['if-none-match'];
            if (clientETag === etag) {
                res.status(304).send();
                return;
            }
            res.send(fileContent);
        }
        catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to retrieve file content',
                statusCode: 500,
                timestamp: new Date(),
            });
        }
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)('game-systems/:id/documents'),
    (0, swagger_1.ApiOperation)({ summary: 'List documents in a game system' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of documents' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game system not found' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['JSON', 'PDF', 'MARKDOWN'] }),
    (0, swagger_1.ApiQuery)({ name: 'tags', required: false, type: [String] }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "findByGameSystem", null);
__decorate([
    (0, common_1.Post)('game-systems/:id/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a document' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Document uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game system not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'System locked or name conflict' }),
    (0, swagger_1.ApiResponse)({ status: 422, description: 'Invalid file type or validation failed' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('displayName')),
    __param(3, (0, common_1.Body)('tags')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('documents/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get document metadata' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document metadata' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('documents/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update document metadata' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'System locked or name conflict' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('documents/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a document' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Document deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'System locked' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('documents/:id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download document content' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document file content' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "download", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('Documents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [document_service_1.DocumentService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map