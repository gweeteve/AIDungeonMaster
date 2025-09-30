import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Req, 
  Res,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentService } from '../services/document.service';
import { 
  CreateDocumentRequest, 
  UpdateDocumentRequest, 
  DocumentQueryOptions,
  RequestWithUser,
} from '../types';
import { Document } from '../models/document.model';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('api')
export class DocumentsController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('game-systems/:id/documents')
  @ApiOperation({ summary: 'List documents in a game system' })
  @ApiResponse({ status: 200, description: 'List of documents' })
  @ApiResponse({ status: 404, description: 'Game system not found' })
  @ApiQuery({ name: 'type', required: false, enum: ['JSON', 'PDF', 'MARKDOWN'] })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  async findByGameSystem(
    @Param('id', ParseUUIDPipe) gameSystemId: string,
    @Query() query: DocumentQueryOptions
  ): Promise<Document[]> {
    return await this.documentService.findByGameSystem(gameSystemId, query);
  }

  @Post('game-systems/:id/documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Game system not found' })
  @ApiResponse({ status: 409, description: 'System locked or name conflict' })
  @ApiResponse({ status: 422, description: 'Invalid file type or validation failed' })
  async upload(
    @Param('id', ParseUUIDPipe) gameSystemId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('displayName') displayName: string,
    @Body('tags') tags: string,
    @Req() req: RequestWithUser
  ): Promise<Document> {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!displayName) {
      throw new Error('Display name is required');
    }

    // TODO: Extract user ID from authentication
    const userId = req.user?.id || 'mock-user-id';

    // Parse tags if provided
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
      } catch {
        parsedTags = [];
      }
    }

    const createRequest: CreateDocumentRequest = {
      file,
      displayName,
      tags: parsedTags,
    };

    return await this.documentService.create(gameSystemId, createRequest, userId);
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get document metadata' })
  @ApiResponse({ status: 200, description: 'Document metadata' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<any> {
    const document = await this.documentService.getDocumentWithRelations(id);
    if (!document) {
      throw new Error('Document not found');
    }
    return document;
  }

  @Put('documents/:id')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 409, description: 'System locked or name conflict' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateRequest: UpdateDocumentRequest,
    @Req() req: RequestWithUser
  ): Promise<Document> {
    // TODO: Extract user ID from authentication
    const userId = req.user?.id || 'mock-user-id';
    return await this.documentService.update(id, updateRequest, userId);
  }

  @Delete('documents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 409, description: 'System locked' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser
  ): Promise<void> {
    // TODO: Extract user ID from authentication
    const userId = req.user?.id || 'mock-user-id';
    await this.documentService.delete(id, userId);
  }

  @Get('documents/:id/download')
  @ApiOperation({ summary: 'Download document content' })
  @ApiResponse({ status: 200, description: 'Document file content' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response
  ): Promise<void> {
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
      
      // Set appropriate headers
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Length', fileContent.length);
      res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
      
      // Generate ETag for caching
      const etag = `"${document.checksum}"`;
      res.setHeader('ETag', etag);
      
      // Check if client has cached version
      const clientETag = res.req.headers['if-none-match'];
      if (clientETag === etag) {
        res.status(304).send();
        return;
      }
      
      res.send(fileContent);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve file content',
        statusCode: 500,
        timestamp: new Date(),
      });
    }
  }
}