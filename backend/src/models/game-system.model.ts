import { IsString, IsOptional, IsBoolean, IsUUID, IsUrl, IsDate, MaxLength, MinLength, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { Document } from './document.model';
import { User } from './user.model';

export class GameSystem {
  @IsUUID()
  id: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsUUID()
  ownerId: string;

  @IsOptional()
  @IsUUID()
  parentSystemId?: string;

  @IsOptional()
  @IsObject()
  validationSchema?: object;

  @IsBoolean()
  isPublic: boolean;

  @IsOptional()
  @IsUUID()
  editLockUserId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  editLockExpiresAt?: Date;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @IsBoolean()
  syncWithParent: boolean;

  // Relationships (not stored directly, populated by services)
  documents?: Document[];
  derivedSystems?: GameSystem[];
  parentSystem?: GameSystem;
  owner?: User;

  constructor() {
    this.id = '';
    this.name = '';
    this.ownerId = '';
    this.isPublic = true; // Default to collaborative model
    this.syncWithParent = true; // Default to sync with parent
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}