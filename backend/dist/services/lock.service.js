"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockService = void 0;
const common_1 = require("@nestjs/common");
let LockService = class LockService {
    constructor() {
        this.locks = new Map();
        this.defaultLockDurationMinutes = 30;
    }
    async acquireLock(gameSystemId, userId, durationMinutes) {
        this.cleanupExpiredLocks();
        const existingLock = this.locks.get(gameSystemId);
        if (existingLock && !existingLock.isExpired() && existingLock.lockedBy !== userId) {
            throw new common_1.ConflictException(`Game system is already locked by another user until ${existingLock.expiresAt.toISOString()}`);
        }
        const duration = durationMinutes || this.defaultLockDurationMinutes;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + duration * 60 * 1000);
        const lock = {
            gameSystemId,
            lockedBy: userId,
            expiresAt,
            acquiredAt: now,
            isExpired() {
                return new Date() > this.expiresAt;
            },
        };
        this.locks.set(gameSystemId, lock);
        return {
            gameSystemId: lock.gameSystemId,
            lockedBy: lock.lockedBy,
            expiresAt: lock.expiresAt,
            acquiredAt: lock.acquiredAt,
        };
    }
    async releaseLock(gameSystemId, userId) {
        const existingLock = this.locks.get(gameSystemId);
        if (!existingLock) {
            return;
        }
        if (existingLock.isExpired()) {
            this.locks.delete(gameSystemId);
            return;
        }
        if (existingLock.lockedBy !== userId) {
            throw new common_1.ForbiddenException('You are not authorized to release this lock');
        }
        this.locks.delete(gameSystemId);
    }
    async getLock(gameSystemId) {
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
    async isLocked(gameSystemId) {
        const lock = await this.getLock(gameSystemId);
        return lock !== null;
    }
    async isLockedByUser(gameSystemId, userId) {
        const lock = await this.getLock(gameSystemId);
        return lock !== null && lock.lockedBy === userId;
    }
    async getAllLocks() {
        this.cleanupExpiredLocks();
        return Array.from(this.locks.values()).map(lock => ({
            gameSystemId: lock.gameSystemId,
            lockedBy: lock.lockedBy,
            expiresAt: lock.expiresAt,
            acquiredAt: lock.acquiredAt,
        }));
    }
    async getLocksForUser(userId) {
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
    async renewLock(gameSystemId, userId, durationMinutes) {
        const existingLock = this.locks.get(gameSystemId);
        if (!existingLock) {
            throw new common_1.ConflictException('No lock exists for this game system');
        }
        if (existingLock.lockedBy !== userId) {
            throw new common_1.ForbiddenException('You are not authorized to renew this lock');
        }
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
    async forceReleaseLock(gameSystemId) {
        this.locks.delete(gameSystemId);
    }
    async releaseAllLocksForUser(userId) {
        const userLocks = Array.from(this.locks.entries()).filter(([_, lock]) => lock.lockedBy === userId);
        for (const [gameSystemId] of userLocks) {
            this.locks.delete(gameSystemId);
        }
    }
    cleanupExpiredLocks() {
        const now = new Date();
        const expiredLocks = [];
        for (const [gameSystemId, lock] of this.locks.entries()) {
            if (lock.isExpired()) {
                expiredLocks.push(gameSystemId);
            }
        }
        for (const gameSystemId of expiredLocks) {
            this.locks.delete(gameSystemId);
        }
    }
    async performScheduledCleanup() {
        this.cleanupExpiredLocks();
        const activeLocksCount = this.locks.size;
        console.log(`Lock cleanup completed. Active locks: ${activeLocksCount}`);
    }
    async getLockStatistics() {
        const totalLocks = this.locks.size;
        let expiredLocks = 0;
        const locksByUser = {};
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
};
exports.LockService = LockService;
exports.LockService = LockService = __decorate([
    (0, common_1.Injectable)()
], LockService);
//# sourceMappingURL=lock.service.js.map