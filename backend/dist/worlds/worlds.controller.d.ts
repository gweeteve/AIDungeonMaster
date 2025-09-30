import { WorldsService } from './worlds.service';
import { CreateWorldRequest, UpdateWorldRequest, WorldResponse } from './dto';
export declare class WorldsController {
    private readonly worldsService;
    constructor(worldsService: WorldsService);
    findAll(): Promise<WorldResponse[]>;
    create(createWorldRequest: CreateWorldRequest): Promise<WorldResponse>;
    findOne(id: string): Promise<WorldResponse>;
    update(id: string, updateWorldRequest: UpdateWorldRequest): Promise<import("./entities/world.entity").World>;
    remove(id: string): Promise<void>;
}
