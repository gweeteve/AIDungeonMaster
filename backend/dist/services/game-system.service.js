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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSystemService = void 0;
const common_1 = require("@nestjs/common");
const game_system_model_1 = require("../models/game-system.model");
const lock_service_1 = require("./lock.service");
const uuid_1 = require("uuid");
let GameSystemService = class GameSystemService {
    constructor(lockService) {
        this.lockService = lockService;
        this.gameSystems = new Map();
    }
    async findAll(options = {}) {
        const { page = 1, limit = 20, search, ownerId } = options;
        let filteredSystems = Array.from(this.gameSystems.values());
        if (search) {
            const searchLower = search.toLowerCase();
            filteredSystems = filteredSystems.filter(system => system.name.toLowerCase().includes(searchLower) ||
                (system.description && system.description.toLowerCase().includes(searchLower)));
        }
        if (ownerId) {
            filteredSystems = filteredSystems.filter(system => system.ownerId === ownerId);
        }
        const total = filteredSystems.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const data = filteredSystems.slice(startIndex, startIndex + limit);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }
    async findById(id) {
        return this.gameSystems.get(id) || null;
    }
    async create(data, userId) {
        const existingSystem = Array.from(this.gameSystems.values()).find(system => system.name === data.name && system.ownerId === userId);
        if (existingSystem) {
            throw new common_1.ConflictException('A game system with this name already exists');
        }
        if (data.parentSystemId) {
            const parentSystem = await this.findById(data.parentSystemId);
            if (!parentSystem) {
                throw new common_1.NotFoundException('Parent system not found');
            }
        }
        const gameSystem = new game_system_model_1.GameSystem();
        gameSystem.id = (0, uuid_1.v4)();
        gameSystem.name = data.name;
        gameSystem.description = data.description;
        gameSystem.imageUrl = data.imageUrl;
        gameSystem.ownerId = userId;
        gameSystem.parentSystemId = data.parentSystemId;
        gameSystem.validationSchema = data.validationSchema;
        gameSystem.syncWithParent = data.syncWithParent ?? true;
        gameSystem.isPublic = true;
        this.gameSystems.set(gameSystem.id, gameSystem);
        return gameSystem;
    }
    async update(id, data, userId) {
        const gameSystem = await this.findById(id);
        if (!gameSystem) {
            throw new common_1.NotFoundException('Game system not found');
        }
        const lock = await this.lockService.getLock(id);
        if (lock && lock.lockedBy !== userId) {
            throw new common_1.ConflictException('Game system is currently locked by another user');
        }
        if (data.name && data.name !== gameSystem.name) {
            const existingSystem = Array.from(this.gameSystems.values()).find(system => system.name === data.name && system.ownerId === userId && system.id !== id);
            if (existingSystem) {
                throw new common_1.ConflictException('A game system with this name already exists');
            }
        }
        if (data.name !== undefined)
            gameSystem.name = data.name;
        if (data.description !== undefined)
            gameSystem.description = data.description;
        if (data.imageUrl !== undefined)
            gameSystem.imageUrl = data.imageUrl;
        if (data.syncWithParent !== undefined)
            gameSystem.syncWithParent = data.syncWithParent;
        if (data.validationSchema !== undefined)
            gameSystem.validationSchema = data.validationSchema;
        gameSystem.updatedAt = new Date();
        this.gameSystems.set(id, gameSystem);
        return gameSystem;
    }
    async delete(id, userId) {
        const gameSystem = await this.findById(id);
        if (!gameSystem) {
            throw new common_1.NotFoundException('Game system not found');
        }
        const derivedSystems = Array.from(this.gameSystems.values()).filter(system => system.parentSystemId === id);
        if (derivedSystems.length > 0) {
            throw new common_1.ConflictException('Cannot delete game system with derived systems');
        }
        try {
            await this.lockService.releaseLock(id, userId);
        }
        catch {
        }
        this.gameSystems.delete(id);
    }
    async acquireLock(id, userId) {
        const gameSystem = await this.findById(id);
        if (!gameSystem) {
            throw new common_1.NotFoundException('Game system not found');
        }
        return await this.lockService.acquireLock(id, userId);
    }
    async releaseLock(id, userId) {
        const gameSystem = await this.findById(id);
        if (!gameSystem) {
            throw new common_1.NotFoundException('Game system not found');
        }
        await this.lockService.releaseLock(id, userId);
    }
    async getDerivedSystems(parentId) {
        return Array.from(this.gameSystems.values()).filter(system => system.parentSystemId === parentId);
    }
    async checkCircularDerivation(systemId, parentId) {
        if (systemId === parentId) {
            return true;
        }
        const parentSystem = await this.findById(parentId);
        if (!parentSystem || !parentSystem.parentSystemId) {
            return false;
        }
        return await this.checkCircularDerivation(systemId, parentSystem.parentSystemId);
    }
};
exports.GameSystemService = GameSystemService;
exports.GameSystemService = GameSystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [lock_service_1.LockService])
], GameSystemService);
//# sourceMappingURL=game-system.service.js.map