import { IsString, IsOptional, IsBoolean, IsUUID, IsEmail, IsUrl, IsDate, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { GameSystem } from './game-system.model';
import { Document } from './document.model';

export interface UserPreferences {
  defaultImageUrl?: string;
  theme: 'light' | 'dark' | 'auto';
  autoLockTimeout: number; // minutes
  notificationSettings: NotificationSettings;
  updatedAt: Date;
}

export interface NotificationSettings {
  editLockNotifications: boolean;
  systemUpdateNotifications: boolean;
  sessionInviteNotifications: boolean;
}

export class User {
  @IsUUID()
  id: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsBoolean()
  isActive: boolean;

  preferences: UserPreferences;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLoginAt?: Date;

  // Relationships (not stored directly, populated by services)
  ownedSystems?: GameSystem[];
  uploadedDocuments?: Document[];

  constructor() {
    this.id = '';
    this.username = '';
    this.email = '';
    this.displayName = '';
    this.isActive = true;
    this.preferences = {
      theme: 'auto',
      autoLockTimeout: 30, // 30 minutes default
      notificationSettings: {
        editLockNotifications: true,
        systemUpdateNotifications: true,
        sessionInviteNotifications: true,
      },
      updatedAt: new Date(),
    };
    this.createdAt = new Date();
  }
}