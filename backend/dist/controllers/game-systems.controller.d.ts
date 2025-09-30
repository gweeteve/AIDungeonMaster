import { GameSystemService } from '../services/game-system.service';
import { CreateGameSystemRequest, UpdateGameSystemRequest, GameSystemQueryOptions, RequestWithUser, PaginatedResponse } from '../types';
import { GameSystem } from '../models/game-system.model';
export declare class GameSystemsController {
    private readonly gameSystemService;
    constructor(gameSystemService: GameSystemService);
    findAll(query: GameSystemQueryOptions): Promise<PaginatedResponse<GameSystem>>;
    create(createRequest: CreateGameSystemRequest, req: RequestWithUser): Promise<GameSystem>;
    findOne(id: string): Promise<GameSystem>;
    update(id: string, updateRequest: UpdateGameSystemRequest, req: RequestWithUser): Promise<GameSystem>;
    remove(id: string, req: RequestWithUser): Promise<void>;
    acquireLock(id: string, req: RequestWithUser): Promise<import("../types").EditLock>;
    releaseLock(id: string, req: RequestWithUser): Promise<void>;
}
