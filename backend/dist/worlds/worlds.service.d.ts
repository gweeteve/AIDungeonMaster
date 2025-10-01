import { World } from './entities/world.entity';
import { LiteDbService } from '../database/litedb.service';
import { CreateWorldRequest, WorldResponse, LaunchResponse } from './dto';
export declare class WorldsService {
    private readonly liteDbService;
    constructor(liteDbService: LiteDbService);
    findAll(): Promise<WorldResponse[]>;
    findById(id: string): Promise<World>;
    create(createWorldRequest: CreateWorldRequest): Promise<WorldResponse>;
    launchWorld(worldId: string): Promise<LaunchResponse>;
    update(id: string, updateData: Partial<World>): Promise<World>;
    delete(id: string): Promise<void>;
}
