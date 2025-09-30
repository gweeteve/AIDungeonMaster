import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { World } from './entities/world.entity';
import { GameSystem } from '../game-systems/entities/game-system.entity';
import { LiteDbService } from '../database/litedb.service';
import { CreateWorldRequest, WorldResponse, LaunchResponse } from './dto';

@Injectable()
export class WorldsService {
  constructor(private readonly liteDbService: LiteDbService) {}

  async findAll(): Promise<WorldResponse[]> {
    const worldsCollection = await this.liteDbService.getCollection<World>('worlds');
    const gameSystemsCollection = await this.liteDbService.getCollection<GameSystem>('gameSystems');
    
    const worlds = await worldsCollection.findAll();
    
    // Sort by lastAccessedAt (most recent first)
    worlds.sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime());
    
    // Enrich with game system data
    const worldResponses: WorldResponse[] = [];
    
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

  async findById(id: string): Promise<World> {
    const worldsCollection = await this.liteDbService.getCollection<World>('worlds');
    const world = await worldsCollection.findById(id);
    
    if (!world) {
      throw new NotFoundException(`World with ID ${id} not found`);
    }
    
    return world;
  }

  async create(createWorldRequest: CreateWorldRequest): Promise<WorldResponse> {
    // Validate game system exists
    const gameSystemsCollection = await this.liteDbService.getCollection<GameSystem>('gameSystems');
    const gameSystem = await gameSystemsCollection.findById(createWorldRequest.gameSystemId);
    
    if (!gameSystem) {
      throw new BadRequestException(`Game system with ID ${createWorldRequest.gameSystemId} not found`);
    }

    if (!gameSystem.isActive) {
      throw new BadRequestException(`Game system ${gameSystem.name} is not active`);
    }

    // Validate world name
    if (!createWorldRequest.name || createWorldRequest.name.trim().length === 0) {
      throw new BadRequestException('World name is required');
    }

    if (createWorldRequest.name.length > 255) {
      throw new BadRequestException('World name must be 255 characters or less');
    }

    // Validate image URL if provided
    if (createWorldRequest.imageUrl) {
      try {
        new URL(createWorldRequest.imageUrl);
      } catch (error) {
        throw new BadRequestException('Invalid image URL format');
      }
    }

    // Create new world
    const world = new World({
      name: createWorldRequest.name.trim(),
      imageUrl: createWorldRequest.imageUrl,
      gameSystemId: createWorldRequest.gameSystemId,
      sessionData: {}
    });

    const worldsCollection = await this.liteDbService.getCollection<World>('worlds');
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

  async launchWorld(worldId: string): Promise<LaunchResponse> {
    const world = await this.findById(worldId);
    
    // Update last accessed timestamp
    world.updateLastAccessed();
    
    const worldsCollection = await this.liteDbService.getCollection<World>('worlds');
    await worldsCollection.update(worldId, world);

    return {
      worldId: world.id,
      launchUrl: `/game/${world.id}`,
      lastAccessedAt: world.lastAccessedAt.toISOString()
    };
  }

  async update(id: string, updateData: Partial<World>): Promise<World> {
    const world = await this.findById(id);
    
    // Update allowed fields
    if (updateData.name !== undefined) {
      if (!updateData.name || updateData.name.trim().length === 0) {
        throw new BadRequestException('World name is required');
      }
      if (updateData.name.length > 255) {
        throw new BadRequestException('World name must be 255 characters or less');
      }
      world.name = updateData.name.trim();
    }

    if (updateData.imageUrl !== undefined) {
      if (updateData.imageUrl) {
        try {
          new URL(updateData.imageUrl);
        } catch (error) {
          throw new BadRequestException('Invalid image URL format');
        }
      }
      world.imageUrl = updateData.imageUrl;
    }

    if (updateData.sessionData !== undefined) {
      world.updateSessionData(updateData.sessionData);
    }

    world.updatedAt = new Date();

    const worldsCollection = await this.liteDbService.getCollection<World>('worlds');
    return await worldsCollection.update(id, world);
  }

  async delete(id: string): Promise<void> {
    const world = await this.findById(id);
    
    const worldsCollection = await this.liteDbService.getCollection<World>('worlds');
    await worldsCollection.delete(id);
  }
}