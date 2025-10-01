import { GameSystemsService } from './game-systems.service';
import { CreateGameSystemRequest, UpdateGameSystemRequest, GameSystemResponse } from './dto';
export declare class GameSystemsController {
    private readonly gameSystemsService;
    constructor(gameSystemsService: GameSystemsService);
    findAllActive(): Promise<GameSystemResponse[]>;
    findAll(): Promise<{
        id: string;
        name: string;
        defaultImageUrl: string;
        description: string | undefined;
        isActive: boolean;
    }[]>;
    getUsageStats(): Promise<Record<string, number>>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        defaultImageUrl: string;
        description: string | undefined;
        isActive: boolean;
    }>;
    create(createGameSystemRequest: CreateGameSystemRequest): Promise<{
        id: string;
        name: string;
        defaultImageUrl: string;
        description: string | undefined;
        isActive: boolean;
    }>;
    update(id: string, updateGameSystemRequest: UpdateGameSystemRequest): Promise<{
        id: string;
        name: string;
        defaultImageUrl: string;
        description: string | undefined;
        isActive: boolean;
    }>;
    activate(id: string): Promise<{
        id: string;
        name: string;
        defaultImageUrl: string;
        description: string | undefined;
        isActive: boolean;
    }>;
    deactivate(id: string): Promise<{
        id: string;
        name: string;
        defaultImageUrl: string;
        description: string | undefined;
        isActive: boolean;
    }>;
    remove(id: string): Promise<void>;
}
