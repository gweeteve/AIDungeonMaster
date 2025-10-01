import { GameSystem } from './game-system.model';
import { Document } from './document.model';
export interface UserPreferences {
    defaultImageUrl?: string;
    theme: 'light' | 'dark' | 'auto';
    autoLockTimeout: number;
    notificationSettings: NotificationSettings;
    updatedAt: Date;
}
export interface NotificationSettings {
    editLockNotifications: boolean;
    systemUpdateNotifications: boolean;
    sessionInviteNotifications: boolean;
}
export declare class User {
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    isActive: boolean;
    preferences: UserPreferences;
    createdAt: Date;
    lastLoginAt?: Date;
    ownedSystems?: GameSystem[];
    uploadedDocuments?: Document[];
    constructor();
}
