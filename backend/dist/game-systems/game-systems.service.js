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
exports.GameSystemsService = void 0;
const common_1 = require("@nestjs/common");
const game_system_entity_1 = require("./entities/game-system.entity");
const litedb_service_1 = require("../database/litedb.service");
let GameSystemsService = class GameSystemsService {
    constructor(liteDbService) {
        this.liteDbService = liteDbService;
    }
    async findAll() {
        const gameSystemsCollection = await this.liteDbService.getCollection('gameSystems');
        return await gameSystemsCollection.findAll();
    }
    async findAllActive() {
        const gameSystemsCollection = await this.liteDbService.getCollection('gameSystems');
        const allSystems = await gameSystemsCollection.findAll();
        const activeSystems = allSystems.filter(system => system.isActive);
        return activeSystems.map(system => system.toResponse());
    }
    async findById(id) {
        const gameSystemsCollection = await this.liteDbService.getCollection('gameSystems');
        const gameSystem = await gameSystemsCollection.findById(id);
        if (!gameSystem) {
            throw new common_1.NotFoundException(`Game system with ID ${id} not found`);
        }
        return gameSystem;
    }
    async create(createGameSystemRequest) {
        const gameSystemsCollection = await this.liteDbService.getCollection('gameSystems');
        const existingSystems = await gameSystemsCollection.findAll();
        const nameExists = existingSystems.some(system => system.name.toLowerCase() === createGameSystemRequest.name.toLowerCase());
        if (nameExists) {
            throw new common_1.BadRequestException(`Game system with name '${createGameSystemRequest.name}' already exists`);
        }
        if (!createGameSystemRequest.name || createGameSystemRequest.name.trim().length === 0) {
            throw new common_1.BadRequestException('Game system name is required');
        }
        if (!createGameSystemRequest.defaultImageUrl) {
            throw new common_1.BadRequestException('Default image URL is required');
        }
        try {
            new URL(createGameSystemRequest.defaultImageUrl);
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid default image URL format');
        }
        const gameSystem = new game_system_entity_1.GameSystem({
            name: createGameSystemRequest.name.trim(),
            defaultImageUrl: createGameSystemRequest.defaultImageUrl,
            description: createGameSystemRequest.description?.trim(),
            rulesetConfig: createGameSystemRequest.rulesetConfig || {},
            isActive: createGameSystemRequest.isActive !== undefined ? createGameSystemRequest.isActive : true
        });
        return await gameSystemsCollection.insert(gameSystem);
    }
    async update(id, updateGameSystemRequest) {
        const gameSystem = await this.findById(id);
        if (updateGameSystemRequest.name !== undefined) {
            if (!updateGameSystemRequest.name || updateGameSystemRequest.name.trim().length === 0) {
                throw new common_1.BadRequestException('Game system name is required');
            }
            const gameSystemsCollection = await this.liteDbService.getCollection('gameSystems');
            const existingSystems = await gameSystemsCollection.findAll();
            const nameExists = existingSystems.some(system => system.id !== id &&
                system.name.toLowerCase() === updateGameSystemRequest.name.toLowerCase());
            if (nameExists) {
                throw new common_1.BadRequestException(`Game system with name '${updateGameSystemRequest.name}' already exists`);
            }
            gameSystem.name = updateGameSystemRequest.name.trim();
        }
        if (updateGameSystemRequest.defaultImageUrl !== undefined) {
            try {
                new URL(updateGameSystemRequest.defaultImageUrl);
            }
            catch (error) {
                throw new common_1.BadRequestException('Invalid default image URL format');
            }
            gameSystem.defaultImageUrl = updateGameSystemRequest.defaultImageUrl;
        }
        if (updateGameSystemRequest.description !== undefined) {
            gameSystem.updateDescription(updateGameSystemRequest.description?.trim() || '');
        }
        if (updateGameSystemRequest.rulesetConfig !== undefined) {
            gameSystem.updateRuleset(updateGameSystemRequest.rulesetConfig);
        }
        if (updateGameSystemRequest.isActive !== undefined) {
            if (updateGameSystemRequest.isActive) {
                gameSystem.activate();
            }
            else {
                gameSystem.deactivate();
            }
        }
        gameSystem.updatedAt = new Date();
        const gameSystemsCollection = await this.liteDbService.getCollection('gameSystems');
        return await gameSystemsCollection.update(id, gameSystem);
    }
    async activate(id) {
        const gameSystem = await this.findById(id);
        gameSystem.activate();
        const gameSystemsCollection = await this.liteDbService.getCollection('gameSystems');
        return await gameSystemsCollection.update(id, gameSystem);
    }
    async deactivate(id) {
        const gameSystem = await this.findById(id);
        const worldsCollection = await this.liteDbService.getCollection('worlds');
        const worldsUsingSystem = await worldsCollection.findAll();
        const activeWorlds = worldsUsingSystem.filter(world => world.gameSystemId === id);
        if (activeWorlds.length > 0) {
            throw new common_1.BadRequestException(`Cannot deactivate game system. ${activeWorlds.length} world(s) are still using this system.`);
        }
        gameSystem.deactivate();
        const gameSystemsCollection = await this.liteDbService.getCollection('gameSystems');
        return await gameSystemsCollection.update(id, gameSystem);
    }
    async delete(id) {
        const gameSystem = await this.findById(id);
        const worldsCollection = await this.liteDbService.getCollection('worlds');
        const worldsUsingSystem = await worldsCollection.findAll();
        const activeWorlds = worldsUsingSystem.filter(world => world.gameSystemId === id);
        if (activeWorlds.length > 0) {
            throw new common_1.BadRequestException(`Cannot delete game system. ${activeWorlds.length} world(s) are still using this system.`);
        }
        const gameSystemsCollection = await this.liteDbService.getCollection('gameSystems');
        await gameSystemsCollection.delete(id);
    }
    async getUsageStats() {
        const worldsCollection = await this.liteDbService.getCollection('worlds');
        const worlds = await worldsCollection.findAll();
        const usageStats = {};
        worlds.forEach(world => {
            const systemId = world.gameSystemId;
            usageStats[systemId] = (usageStats[systemId] || 0) + 1;
        });
        return usageStats;
    }
};
exports.GameSystemsService = GameSystemsService;
exports.GameSystemsService = GameSystemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [litedb_service_1.LiteDbService])
], GameSystemsService);
//# sourceMappingURL=game-systems.service.js.map