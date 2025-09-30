import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Req, 
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { GameSystemService } from '../services/game-system.service';
import { 
  CreateGameSystemRequest, 
  UpdateGameSystemRequest, 
  GameSystemQueryOptions,
  RequestWithUser,
  PaginatedResponse,
} from '../types';
import { GameSystem } from '../models/game-system.model';

@ApiTags('Game Systems')
@ApiBearerAuth()
@Controller('api/game-systems')
export class GameSystemsController {
  constructor(private readonly gameSystemService: GameSystemService) {}

  @Get()
  @ApiOperation({ summary: 'List all game systems' })
  @ApiResponse({ status: 200, description: 'List of game systems' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'ownerId', required: false, type: String })
  async findAll(
    @Query() query: GameSystemQueryOptions
  ): Promise<PaginatedResponse<GameSystem>> {
    // TODO: Add authentication guard
    return await this.gameSystemService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new game system' })
  @ApiResponse({ status: 201, description: 'Game system created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'Game system name already exists' })
  async create(
    @Body(ValidationPipe) createRequest: CreateGameSystemRequest,
    @Req() req: RequestWithUser
  ): Promise<GameSystem> {
    // TODO: Extract user ID from authentication
    const userId = req.user?.id || 'mock-user-id';
    return await this.gameSystemService.create(createRequest, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific game system' })
  @ApiResponse({ status: 200, description: 'Game system details' })
  @ApiResponse({ status: 404, description: 'Game system not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<GameSystem> {
    const gameSystem = await this.gameSystemService.findById(id);
    if (!gameSystem) {
      throw new Error('Game system not found');
    }
    return gameSystem;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a game system' })
  @ApiResponse({ status: 200, description: 'Game system updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Game system not found' })
  @ApiResponse({ status: 409, description: 'System is locked or name conflict' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateRequest: UpdateGameSystemRequest,
    @Req() req: RequestWithUser
  ): Promise<GameSystem> {
    // TODO: Extract user ID from authentication
    const userId = req.user?.id || 'mock-user-id';
    return await this.gameSystemService.update(id, updateRequest, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a game system' })
  @ApiResponse({ status: 204, description: 'Game system deleted successfully' })
  @ApiResponse({ status: 404, description: 'Game system not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete system in use' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser
  ): Promise<void> {
    // TODO: Extract user ID from authentication
    const userId = req.user?.id || 'mock-user-id';
    await this.gameSystemService.delete(id, userId);
  }

  @Post(':id/lock')
  @ApiOperation({ summary: 'Acquire edit lock' })
  @ApiResponse({ status: 200, description: 'Lock acquired successfully' })
  @ApiResponse({ status: 404, description: 'Game system not found' })
  @ApiResponse({ status: 409, description: 'System already locked' })
  async acquireLock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser
  ) {
    // TODO: Extract user ID from authentication
    const userId = req.user?.id || 'mock-user-id';
    return await this.gameSystemService.acquireLock(id, userId);
  }

  @Delete(':id/lock')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Release edit lock' })
  @ApiResponse({ status: 204, description: 'Lock released successfully' })
  @ApiResponse({ status: 404, description: 'Game system not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to release lock' })
  async releaseLock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser
  ): Promise<void> {
    // TODO: Extract user ID from authentication
    const userId = req.user?.id || 'mock-user-id';
    await this.gameSystemService.releaseLock(id, userId);
  }
}