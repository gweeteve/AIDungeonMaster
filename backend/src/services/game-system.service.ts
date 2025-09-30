import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { GameSystem } from '../models/game-system.model';
import { 
  IGameSystemService, 
  CreateGameSystemRequest, 
  UpdateGameSystemRequest, 
  EditLock, 
  PaginatedResponse, 
  GameSystemQueryOptions 
} from '../types';
import { LockService } from './lock.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GameSystemService implements IGameSystemService {
  private gameSystems: Map<string, GameSystem> = new Map();

  constructor(private lockService: LockService) {}

  async findAll(options: GameSystemQueryOptions = {}): Promise<PaginatedResponse<GameSystem>> {
    const { page = 1, limit = 20, search, ownerId } = options;
    
    let filteredSystems = Array.from(this.gameSystems.values());

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSystems = filteredSystems.filter(system => 
        system.name.toLowerCase().includes(searchLower) ||
        (system.description && system.description.toLowerCase().includes(searchLower))
      );
    }

    if (ownerId) {
      filteredSystems = filteredSystems.filter(system => system.ownerId === ownerId);
    }

    // Pagination
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

  async findById(id: string): Promise<GameSystem | null> {
    return this.gameSystems.get(id) || null;
  }

  async create(data: CreateGameSystemRequest, userId: string): Promise<GameSystem> {
    // Check for duplicate names by same user
    const existingSystem = Array.from(this.gameSystems.values()).find(
      system => system.name === data.name && system.ownerId === userId
    );

    if (existingSystem) {
      throw new ConflictException('A game system with this name already exists');
    }

    // Validate parent system if deriving
    if (data.parentSystemId) {
      const parentSystem = await this.findById(data.parentSystemId);
      if (!parentSystem) {
        throw new NotFoundException('Parent system not found');
      }
    }

    const gameSystem = new GameSystem();
    gameSystem.id = uuidv4();
    gameSystem.name = data.name;
    gameSystem.description = data.description;
    gameSystem.imageUrl = data.imageUrl;
    gameSystem.ownerId = userId;
    gameSystem.parentSystemId = data.parentSystemId;
    gameSystem.validationSchema = data.validationSchema;
    gameSystem.syncWithParent = data.syncWithParent ?? true;
    gameSystem.isPublic = true; // Collaborative model

    this.gameSystems.set(gameSystem.id, gameSystem);

    return gameSystem;
  }

  async update(id: string, data: UpdateGameSystemRequest, userId: string): Promise<GameSystem> {
    const gameSystem = await this.findById(id);
    if (!gameSystem) {
      throw new NotFoundException('Game system not found');
    }

    // Check if system is locked by another user
    const lock = await this.lockService.getLock(id);
    if (lock && lock.lockedBy !== userId) {
      throw new ConflictException('Game system is currently locked by another user');
    }

    // Check for name conflicts if name is being updated
    if (data.name && data.name !== gameSystem.name) {
      const existingSystem = Array.from(this.gameSystems.values()).find(
        system => system.name === data.name && system.ownerId === userId && system.id !== id
      );

      if (existingSystem) {
        throw new ConflictException('A game system with this name already exists');
      }
    }

    // Update fields
    if (data.name !== undefined) gameSystem.name = data.name;
    if (data.description !== undefined) gameSystem.description = data.description;
    if (data.imageUrl !== undefined) gameSystem.imageUrl = data.imageUrl;
    if (data.syncWithParent !== undefined) gameSystem.syncWithParent = data.syncWithParent;
    if (data.validationSchema !== undefined) gameSystem.validationSchema = data.validationSchema;
    
    gameSystem.updatedAt = new Date();

    this.gameSystems.set(id, gameSystem);

    return gameSystem;
  }

  async delete(id: string, userId: string): Promise<void> {
    const gameSystem = await this.findById(id);
    if (!gameSystem) {
      throw new NotFoundException('Game system not found');
    }

    // Check for derived systems (prevent deletion if children exist)
    const derivedSystems = Array.from(this.gameSystems.values()).filter(
      system => system.parentSystemId === id
    );

    if (derivedSystems.length > 0) {
      throw new ConflictException('Cannot delete game system with derived systems');
    }

    // Check for active sessions (would be implemented when sessions are added)
    // For now, assume no active sessions

    // Release any existing lock
    try {
      await this.lockService.releaseLock(id, userId);
    } catch {
      // Ignore if no lock exists
    }

    this.gameSystems.delete(id);
  }

  async acquireLock(id: string, userId: string): Promise<EditLock> {
    const gameSystem = await this.findById(id);
    if (!gameSystem) {
      throw new NotFoundException('Game system not found');
    }

    return await this.lockService.acquireLock(id, userId);
  }

  async releaseLock(id: string, userId: string): Promise<void> {
    const gameSystem = await this.findById(id);
    if (!gameSystem) {
      throw new NotFoundException('Game system not found');
    }

    await this.lockService.releaseLock(id, userId);
  }

  // Helper method to get derived systems
  async getDerivedSystems(parentId: string): Promise<GameSystem[]> {
    return Array.from(this.gameSystems.values()).filter(
      system => system.parentSystemId === parentId
    );
  }

  // Helper method to check for circular derivation
  private async checkCircularDerivation(systemId: string, parentId: string): Promise<boolean> {
    if (systemId === parentId) {
      return true;
    }

    const parentSystem = await this.findById(parentId);
    if (!parentSystem || !parentSystem.parentSystemId) {
      return false;
    }

    return await this.checkCircularDerivation(systemId, parentSystem.parentSystemId);
  }
}