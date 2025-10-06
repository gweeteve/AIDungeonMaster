import { WorldsService } from './worlds.service';
import { LaunchResponse } from './dto';
export declare class LaunchController {
    private readonly worldsService;
    constructor(worldsService: WorldsService);
    launchWorld(worldId: string): Promise<LaunchResponse>;
}
