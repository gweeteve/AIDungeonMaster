import { EditLock } from '../types';
export declare class LockService {
    private locks;
    private readonly defaultLockDurationMinutes;
    acquireLock(gameSystemId: string, userId: string, durationMinutes?: number): Promise<EditLock>;
    releaseLock(gameSystemId: string, userId: string): Promise<void>;
    getLock(gameSystemId: string): Promise<EditLock | null>;
    isLocked(gameSystemId: string): Promise<boolean>;
    isLockedByUser(gameSystemId: string, userId: string): Promise<boolean>;
    getAllLocks(): Promise<EditLock[]>;
    getLocksForUser(userId: string): Promise<EditLock[]>;
    renewLock(gameSystemId: string, userId: string, durationMinutes?: number): Promise<EditLock>;
    forceReleaseLock(gameSystemId: string): Promise<void>;
    releaseAllLocksForUser(userId: string): Promise<void>;
    private cleanupExpiredLocks;
    performScheduledCleanup(): Promise<void>;
    getLockStatistics(): Promise<{
        totalLocks: number;
        expiredLocks: number;
        activeLocks: number;
        locksByUser: Record<string, number>;
    }>;
}
