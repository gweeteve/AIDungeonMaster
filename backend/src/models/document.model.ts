import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsArray, IsBoolean, IsDate, MaxLength, MinLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { GameSystem } from './game-system.model';
import { User } from './user.model';

export enum DocumentType {
  JSON = 'JSON',
  PDF = 'PDF',
  MARKDOWN = 'MARKDOWN',
}

export class Document {
  @IsUUID()
  id: string;

  @IsUUID()
  gameSystemId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  filename: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName: string;

  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  filePath: string;

  @IsNumber()
  @Min(0)
  fileSize: number;

  @IsString()
  mimeType: string;

  @IsUUID()
  uploadedBy: string;

  @IsString()
  checksum: string;

  @IsArray()
  @IsString({ each: true })
  validationErrors: string[];

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsNumber()
  @Min(1)
  version: number;

  @IsBoolean()
  isActive: boolean;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  // Relationships (not stored directly, populated by services)
  gameSystem?: GameSystem | null;
  uploader?: User;
  previousVersions?: Document[];

  constructor() {
    this.id = '';
    this.gameSystemId = '';
    this.filename = '';
    this.displayName = '';
    this.type = DocumentType.JSON;
    this.filePath = '';
    this.fileSize = 0;
    this.mimeType = '';
    this.uploadedBy = '';
    this.checksum = '';
    this.validationErrors = [];
    this.tags = [];
    this.version = 1;
    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}