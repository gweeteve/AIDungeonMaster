import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { EditLock } from '../types';

interface StoredLock extends EditLock {
  isExpired(): boolean;
}

@Injectable()
export class LockService {
  private locks: Map<string, StoredLock> = new Map();
  private readonly defaultLockDurationMinutes = 30;

  async acquireLock(gameSystemId: string, userId: string, durationMinutes?: number): Promise<EditLock> {
    // Clean up expired locks first
    this.cleanupExpiredLocks();

    const existingLock = this.locks.get(gameSystemId);

    // Check if already locked by a different user
    if (existingLock && !existingLock.isExpired() && existingLock.lockedBy !== userId) {
      throw new ConflictException(`Game system is already locked by another user until ${existingLock.expiresAt.toISOString()}`);
    }

    // Create or update lock
    const duration = durationMinutes || this.defaultLockDurationMinutes;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 1000);

    const lock: StoredLock = {
      gameSystemId,
      lockedBy: userId,
      expiresAt,
      acquiredAt: now,
      isExpired(): boolean {
        return new Date() > this.expiresAt;
      },
    };

    this.locks.set(gameSystemId, lock);

    // Return lock without the isExpired method
    return {
      gameSystemId: lock.gameSystemId,
      lockedBy: lock.lockedBy,
      expiresAt: lock.expiresAt,
      acquiredAt: lock.acquiredAt,
    };
  }

  async releaseLock(gameSystemId: string, userId: string): Promise<void> {
    const existingLock = this.locks.get(gameSystemId);

    if (!existingLock) {
      // Lock doesn't exist - this is idempotent
      return;
    }

    if (existingLock.isExpired()) {
      // Lock is expired, safe to remove
      this.locks.delete(gameSystemId);
      return;
    }

    if (existingLock.lockedBy !== userId) {
      throw new ForbiddenException('You are not authorized to release this lock');
    }

    this.locks.delete(gameSystemId);
  }

  async getLock(gameSystemId: string): Promise<EditLock | null> {
    this.cleanupExpiredLocks();
    
    const lock = this.locks.get(gameSystemId);
    if (!lock || lock.isExpired()) {
      return null;
    }

    return {
      gameSystemId: lock.gameSystemId,
      lockedBy: lock.lockedBy,
      expiresAt: lock.expiresAt,
      acquiredAt: lock.acquiredAt,
    };
  }

  async isLocked(gameSystemId: string): Promise<boolean> {
    const lock = await this.getLock(gameSystemId);
    return lock !== null;
  }

  async isLockedByUser(gameSystemId: string, userId: string): Promise<boolean> {
    const lock = await this.getLock(gameSystemId);
    return lock !== null && lock.lockedBy === userId;
  }

  async getAllLocks(): Promise<EditLock[]> {
    this.cleanupExpiredLocks();
    
    return Array.from(this.locks.values()).map(lock => ({
      gameSystemId: lock.gameSystemId,
      lockedBy: lock.lockedBy,
      expiresAt: lock.expiresAt,
      acquiredAt: lock.acquiredAt,
    }));
  }

  async getLocksForUser(userId: string): Promise<EditLock[]> {
    this.cleanupExpiredLocks();
    
    return Array.from(this.locks.values())
      .filter(lock => lock.lockedBy === userId)
      .map(lock => ({
        gameSystemId: lock.gameSystemId,
        lockedBy: lock.lockedBy,
        expiresAt: lock.expiresAt,
        acquiredAt: lock.acquiredAt,
      }));
  }

  async renewLock(gameSystemId: string, userId: string, durationMinutes?: number): Promise<EditLock> {
    const existingLock = this.locks.get(gameSystemId);

    if (!existingLock) {
      throw new ConflictException('No lock exists for this game system');
    }

    if (existingLock.lockedBy !== userId) {
      throw new ForbiddenException('You are not authorized to renew this lock');
    }

    // Renew the lock by extending expiration
    const duration = durationMinutes || this.defaultLockDurationMinutes;
    const newExpiresAt = new Date(Date.now() + duration * 60 * 1000);

    existingLock.expiresAt = newExpiresAt;
    this.locks.set(gameSystemId, existingLock);

    return {
      gameSystemId: existingLock.gameSystemId,
      lockedBy: existingLock.lockedBy,
      expiresAt: existingLock.expiresAt,
      acquiredAt: existingLock.acquiredAt,
    };
  }

  async forceReleaseLock(gameSystemId: string): Promise<void> {
    // Admin function to force release any lock
    this.locks.delete(gameSystemId);
  }

  async releaseAllLocksForUser(userId: string): Promise<void> {
    // Release all locks held by a specific user
    const userLocks = Array.from(this.locks.entries()).filter(
      ([_, lock]) => lock.lockedBy === userId
    );

    for (const [gameSystemId] of userLocks) {
      this.locks.delete(gameSystemId);
    }
  }

  private cleanupExpiredLocks(): void {
    const now = new Date();
    const expiredLocks: string[] = [];

    for (const [gameSystemId, lock] of this.locks.entries()) {
      if (lock.isExpired()) {
        expiredLocks.push(gameSystemId);
      }
    }

    for (const gameSystemId of expiredLocks) {
      this.locks.delete(gameSystemId);
    }
  }

  // Method to run periodic cleanup (would be called by a scheduled task)
  async performScheduledCleanup(): Promise<void> {
    this.cleanupExpiredLocks();
    
    const activeLocksCount = this.locks.size;
    console.log(`Lock cleanup completed. Active locks: ${activeLocksCount}`);
  }

  // Get statistics about locks
  async getLockStatistics(): Promise<{
    totalLocks: number;
    expiredLocks: number;
    activeLocks: number;
    locksByUser: Record<string, number>;
  }> {
    const totalLocks = this.locks.size;
    let expiredLocks = 0;
    const locksByUser: Record<string, number> = {};

    for (const lock of this.locks.values()) {
      if (lock.isExpired()) {
        expiredLocks++;
      }

      locksByUser[lock.lockedBy] = (locksByUser[lock.lockedBy] || 0) + 1;
    }

    return {
      totalLocks,
      expiredLocks,
      activeLocks: totalLocks - expiredLocks,
      locksByUser,
    };
  }
}