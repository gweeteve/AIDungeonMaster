import { Document } from './document.model';
import { User } from './user.model';
export declare class GameSystem {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    ownerId: string;
    parentSystemId?: string;
    validationSchema?: object;
    isPublic: boolean;
    editLockUserId?: string;
    editLockExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    syncWithParent: boolean;
    documents?: Document[];
    derivedSystems?: GameSystem[];
    parentSystem?: GameSystem;
    owner?: User;
    constructor();
}
