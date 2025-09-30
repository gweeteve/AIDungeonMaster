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
exports.WorldsService = void 0;
const common_1 = require("@nestjs/common");
const world_entity_1 = require("./entities/world.entity");
const litedb_service_1 = require("../database/litedb.service");
let WorldsService = class WorldsService {
    constructor(liteDbService) {
        this.liteDbService = liteDbService;
    }
    async findAll() {
        const worldsCollection = await this.liteDbService.getCollection('worlds');
        const gameSystemsCollection = await this.liteDbService.getCollection('gameSystems');
        const worlds = await worldsCollection.findAll();
        worlds.sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime());
        const worldResponses = [];
        for (const world of worlds) {
            const gameSystem = await gameSystemsCollection.findById(world.gameSystemId);
            if (gameSystem) {
                worldResponses.push({
                    id: world.id,
                    name: world.name,
                    imageUrl: world.imageUrl,
                    gameSystem: {
                        id: gameSystem.id,
                        name: gameSystem.name,
                        defaultImageUrl: gameSystem.defaultImageUrl
                    },
                    lastAccessedAt: world.lastAccessedAt.toISOString(),
                    createdAt: world.createdAt.toISOString()
                });
            }
        }
        return worldResponses;
    }
    async findById(id) {
        const worldsCollection = await this.liteDbService.getCollection('worlds');
        const world = await worldsCollection.findById(id);
        if (!world) {
            throw new common_1.NotFoundException(`World with ID ${id} not found`);
        }
        return world;
    }
    async create(createWorldRequest) {
        const gameSystemsCollection = await this.liteDbService.getCollection('gameSystems');
        const gameSystem = await gameSystemsCollection.findById(createWorldRequest.gameSystemId);
        if (!gameSystem) {
            throw new common_1.BadRequestException(`Game system with ID ${createWorldRequest.gameSystemId} not found`);
        }
        if (!gameSystem.isActive) {
            throw new common_1.BadRequestException(`Game system ${gameSystem.name} is not active`);
        }
        if (!createWorldRequest.name || createWorldRequest.name.trim().length === 0) {
            throw new common_1.BadRequestException('World name is required');
        }
        if (createWorldRequest.name.length > 255) {
            throw new common_1.BadRequestException('World name must be 255 characters or less');
        }
        if (createWorldRequest.imageUrl) {
            try {
                new URL(createWorldRequest.imageUrl);
            }
            catch (error) {
                throw new common_1.BadRequestException('Invalid image URL format');
            }
        }
        const world = new world_entity_1.World({
            name: createWorldRequest.name.trim(),
            imageUrl: createWorldRequest.imageUrl,
            gameSystemId: createWorldRequest.gameSystemId,
            sessionData: {}
        });
        const worldsCollection = await this.liteDbService.getCollection('worlds');
        const savedWorld = await worldsCollection.insert(world);
        return {
            id: savedWorld.id,
            name: savedWorld.name,
            imageUrl: savedWorld.imageUrl,
            gameSystem: {
                id: gameSystem.id,
                name: gameSystem.name,
                defaultImageUrl: gameSystem.defaultImageUrl
            },
            lastAccessedAt: savedWorld.lastAccessedAt.toISOString(),
            createdAt: savedWorld.createdAt.toISOString()
        };
    }
    async launchWorld(worldId) {
        const world = await this.findById(worldId);
        world.updateLastAccessed();
        const worldsCollection = await this.liteDbService.getCollection('worlds');
        await worldsCollection.update(worldId, world);
        return {
            worldId: world.id,
            launchUrl: `/game/${world.id}`,
            lastAccessedAt: world.lastAccessedAt.toISOString()
        };
    }
    async update(id, updateData) {
        const world = await this.findById(id);
        if (updateData.name !== undefined) {
            if (!updateData.name || updateData.name.trim().length === 0) {
                throw new common_1.BadRequestException('World name is required');
            }
            if (updateData.name.length > 255) {
                throw new common_1.BadRequestException('World name must be 255 characters or less');
            }
            world.name = updateData.name.trim();
        }
        if (updateData.imageUrl !== undefined) {
            if (updateData.imageUrl) {
                try {
                    new URL(updateData.imageUrl);
                }
                catch (error) {
                    throw new common_1.BadRequestException('Invalid image URL format');
                }
            }
            world.imageUrl = updateData.imageUrl;
        }
        if (updateData.sessionData !== undefined) {
            world.updateSessionData(updateData.sessionData);
        }
        world.updatedAt = new Date();
        const worldsCollection = await this.liteDbService.getCollection('worlds');
        return await worldsCollection.update(id, world);
    }
    async delete(id) {
        const world = await this.findById(id);
        const worldsCollection = await this.liteDbService.getCollection('worlds');
        await worldsCollection.delete(id);
    }
};
exports.WorldsService = WorldsService;
exports.WorldsService = WorldsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [litedb_service_1.LiteDbService])
], WorldsService);
//# sourceMappingURL=worlds.service.js.map