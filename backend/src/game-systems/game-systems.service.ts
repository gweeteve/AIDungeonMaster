import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GameSystem } from './entities/game-system.entity';
import { LiteDbService } from '../database/litedb.service';
import { CreateGameSystemRequest, UpdateGameSystemRequest, GameSystemResponse } from './dto';

@Injectable()
export class GameSystemsService {
  constructor(private readonly liteDbService: LiteDbService) {}

  async findAll(): Promise<GameSystem[]> {
    const gameSystemsCollection = await this.liteDbService.getCollection<GameSystem>('gameSystems');
    return await gameSystemsCollection.findAll();
  }

  async findAllActive(): Promise<GameSystemResponse[]> {
    const gameSystemsCollection = await this.liteDbService.getCollection<GameSystem>('gameSystems');
    const allSystems = await gameSystemsCollection.findAll();
    
    const activeSystems = allSystems.filter(system => system.isActive);
    
    return activeSystems.map(system => system.toResponse());
  }

  async findById(id: string): Promise<GameSystem> {
    const gameSystemsCollection = await this.liteDbService.getCollection<GameSystem>('gameSystems');
    const gameSystem = await gameSystemsCollection.findById(id);
    
    if (!gameSystem) {
      throw new NotFoundException(`Game system with ID ${id} not found`);
    }
    
    return gameSystem;
  }

  async create(createGameSystemRequest: CreateGameSystemRequest): Promise<GameSystem> {
    // Validate name uniqueness
    const gameSystemsCollection = await this.liteDbService.getCollection<GameSystem>('gameSystems');
    const existingSystems = await gameSystemsCollection.findAll();
    
    const nameExists = existingSystems.some(
      system => system.name.toLowerCase() === createGameSystemRequest.name.toLowerCase()
    );
    
    if (nameExists) {
      throw new BadRequestException(`Game system with name '${createGameSystemRequest.name}' already exists`);
    }

    // Validate required fields
    if (!createGameSystemRequest.name || createGameSystemRequest.name.trim().length === 0) {
      throw new BadRequestException('Game system name is required');
    }

    if (!createGameSystemRequest.defaultImageUrl) {
      throw new BadRequestException('Default image URL is required');
    }

    // Validate image URL format
    try {
      new URL(createGameSystemRequest.defaultImageUrl);
    } catch (error) {
      throw new BadRequestException('Invalid default image URL format');
    }

    // Create new game system
    const gameSystem = new GameSystem({
      name: createGameSystemRequest.name.trim(),
      defaultImageUrl: createGameSystemRequest.defaultImageUrl,
      description: createGameSystemRequest.description?.trim(),
      rulesetConfig: createGameSystemRequest.rulesetConfig || {},
      isActive: createGameSystemRequest.isActive !== undefined ? createGameSystemRequest.isActive : true
    });

    return await gameSystemsCollection.insert(gameSystem);
  }

  async update(id: string, updateGameSystemRequest: UpdateGameSystemRequest): Promise<GameSystem> {
    const gameSystem = await this.findById(id);
    
    // Update allowed fields
    if (updateGameSystemRequest.name !== undefined) {
      if (!updateGameSystemRequest.name || updateGameSystemRequest.name.trim().length === 0) {
        throw new BadRequestException('Game system name is required');
      }

      // Check name uniqueness (excluding current system)
      const gameSystemsCollection = await this.liteDbService.getCollection<GameSystem>('gameSystems');
      const existingSystems = await gameSystemsCollection.findAll();
      
      const nameExists = existingSystems.some(
        system => system.id !== id && 
        system.name.toLowerCase() === updateGameSystemRequest.name.toLowerCase()
      );
      
      if (nameExists) {
        throw new BadRequestException(`Game system with name '${updateGameSystemRequest.name}' already exists`);
      }

      gameSystem.name = updateGameSystemRequest.name.trim();
    }

    if (updateGameSystemRequest.defaultImageUrl !== undefined) {
      try {
        new URL(updateGameSystemRequest.defaultImageUrl);
      } catch (error) {
        throw new BadRequestException('Invalid default image URL format');
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
      } else {
        gameSystem.deactivate();
      }
    }

    gameSystem.updatedAt = new Date();

    const gameSystemsCollection = await this.liteDbService.getCollection<GameSystem>('gameSystems');
    return await gameSystemsCollection.update(id, gameSystem);
  }

  async activate(id: string): Promise<GameSystem> {
    const gameSystem = await this.findById(id);
    gameSystem.activate();

    const gameSystemsCollection = await this.liteDbService.getCollection<GameSystem>('gameSystems');
    return await gameSystemsCollection.update(id, gameSystem);
  }

  async deactivate(id: string): Promise<GameSystem> {
    const gameSystem = await this.findById(id);
    
    // Check if any worlds are using this system
    const worldsCollection = await this.liteDbService.getCollection('worlds');
    const worldsUsingSystem = await worldsCollection.findAll();
    const activeWorlds = worldsUsingSystem.filter(world => world.gameSystemId === id);
    
    if (activeWorlds.length > 0) {
      throw new BadRequestException(
        `Cannot deactivate game system. ${activeWorlds.length} world(s) are still using this system.`
      );
    }

    gameSystem.deactivate();

    const gameSystemsCollection = await this.liteDbService.getCollection<GameSystem>('gameSystems');
    return await gameSystemsCollection.update(id, gameSystem);
  }

  async delete(id: string): Promise<void> {
    const gameSystem = await this.findById(id);
    
    // Check if any worlds are using this system
    const worldsCollection = await this.liteDbService.getCollection('worlds');
    const worldsUsingSystem = await worldsCollection.findAll();
    const activeWorlds = worldsUsingSystem.filter(world => world.gameSystemId === id);
    
    if (activeWorlds.length > 0) {
      throw new BadRequestException(
        `Cannot delete game system. ${activeWorlds.length} world(s) are still using this system.`
      );
    }

    const gameSystemsCollection = await this.liteDbService.getCollection<GameSystem>('gameSystems');
    await gameSystemsCollection.delete(id);
  }

  async getUsageStats(): Promise<Record<string, number>> {
    const worldsCollection = await this.liteDbService.getCollection('worlds');
    const worlds = await worldsCollection.findAll();
    
    const usageStats: Record<string, number> = {};
    
    // Count worlds per game system
    worlds.forEach(world => {
      const systemId = world.gameSystemId;
      usageStats[systemId] = (usageStats[systemId] || 0) + 1;
    });
    
    return usageStats;
  }
}