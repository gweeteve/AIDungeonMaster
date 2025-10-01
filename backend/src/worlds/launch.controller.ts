import { Controller, Post, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WorldsService } from './worlds.service';
import { LaunchResponse, ErrorResponse } from './dto';

@ApiTags('worlds')
@Controller('api/worlds')
export class LaunchController {
  constructor(private readonly worldsService: WorldsService) {}

  @Post(':worldId/launch')
  @ApiOperation({ summary: 'Launch a world' })
  @ApiParam({ name: 'worldId', description: 'World ID to launch' })
  @ApiResponse({ 
    status: 200, 
    description: 'World launched successfully',
    type: LaunchResponse
  })
  @ApiResponse({ 
    status: 404, 
    description: 'World not found',
    type: ErrorResponse
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error',
    type: ErrorResponse
  })
  @HttpCode(HttpStatus.OK)
  async launchWorld(@Param('worldId') worldId: string): Promise<LaunchResponse> {
    return await this.worldsService.launchWorld(worldId);
  }
}