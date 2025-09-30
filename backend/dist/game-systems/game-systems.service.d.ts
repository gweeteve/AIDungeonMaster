import { GameSystem } from './entities/game-system.entity';
import { LiteDbService } from '../database/litedb.service';
import { CreateGameSystemRequest, UpdateGameSystemRequest, GameSystemResponse } from './dto';
export declare class GameSystemsService {
    private readonly liteDbService;
    constructor(liteDbService: LiteDbService);
    findAll(): Promise<GameSystem[]>;
    findAllActive(): Promise<GameSystemResponse[]>;
    findById(id: string): Promise<GameSystem>;
    create(createGameSystemRequest: CreateGameSystemRequest): Promise<GameSystem>;
    update(id: string, updateGameSystemRequest: UpdateGameSystemRequest): Promise<GameSystem>;
    activate(id: string): Promise<GameSystem>;
    deactivate(id: string): Promise<GameSystem>;
    delete(id: string): Promise<void>;
    getUsageStats(): Promise<Record<string, number>>;
}
