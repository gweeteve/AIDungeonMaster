import { GameSystem } from '../models/game-system.model';
import { IGameSystemService, CreateGameSystemRequest, UpdateGameSystemRequest, EditLock, PaginatedResponse, GameSystemQueryOptions } from '../types';
import { LockService } from './lock.service';
export declare class GameSystemService implements IGameSystemService {
    private lockService;
    private gameSystems;
    constructor(lockService: LockService);
    findAll(options?: GameSystemQueryOptions): Promise<PaginatedResponse<GameSystem>>;
    findById(id: string): Promise<GameSystem | null>;
    create(data: CreateGameSystemRequest, userId: string): Promise<GameSystem>;
    update(id: string, data: UpdateGameSystemRequest, userId: string): Promise<GameSystem>;
    delete(id: string, userId: string): Promise<void>;
    acquireLock(id: string, userId: string): Promise<EditLock>;
    releaseLock(id: string, userId: string): Promise<void>;
    getDerivedSystems(parentId: string): Promise<GameSystem[]>;
    private checkCircularDerivation;
}
