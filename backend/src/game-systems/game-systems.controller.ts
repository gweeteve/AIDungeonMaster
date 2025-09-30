import { Controller, Get, Post, Body, Param, Put, Delete, Patch, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { GameSystemsService } from './game-systems.service';
import { CreateGameSystemRequest, UpdateGameSystemRequest, GameSystemResponse, ErrorResponse } from './dto';

@ApiTags('game-systems')
@Controller('api/game-systems')
export class GameSystemsController {
  constructor(private readonly gameSystemsService: GameSystemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active game systems' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of active game systems',
    type: [GameSystemResponse]
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error',
    type: ErrorResponse
  })
  async findAllActive(): Promise<GameSystemResponse[]> {
    return await this.gameSystemsService.findAllActive();
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all game systems (including inactive)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all game systems'
  })
  async findAll() {
    const systems = await this.gameSystemsService.findAll();
    return systems.map(system => system.toResponse());
  }

  @Get('usage-stats')
  @ApiOperation({ summary: 'Get usage statistics for all game systems' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usage statistics by game system ID'
  })
  async getUsageStats(): Promise<Record<string, number>> {
    return await this.gameSystemsService.getUsageStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific game system by ID' })
  @ApiParam({ name: 'id', description: 'Game system ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Game system found'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Game system not found',
    type: ErrorResponse
  })
  async findOne(@Param('id') id: string) {
    const gameSystem = await this.gameSystemsService.findById(id);
    return gameSystem.toResponse();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new game system' })
  @ApiBody({ 
    type: CreateGameSystemRequest,
    description: 'Game system creation data'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Game system created successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error',
    type: ErrorResponse
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) 
    createGameSystemRequest: CreateGameSystemRequest
  ) {
    const gameSystem = await this.gameSystemsService.create(createGameSystemRequest);
    return gameSystem.toResponse();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a game system' })
  @ApiParam({ name: 'id', description: 'Game system ID' })
  @ApiBody({ 
    type: UpdateGameSystemRequest,
    description: 'Game system update data'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Game system updated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Game system not found',
    type: ErrorResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error',
    type: ErrorResponse
  })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) 
    updateGameSystemRequest: UpdateGameSystemRequest
  ) {
    const gameSystem = await this.gameSystemsService.update(id, updateGameSystemRequest);
    return gameSystem.toResponse();
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a game system' })
  @ApiParam({ name: 'id', description: 'Game system ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Game system activated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Game system not found',
    type: ErrorResponse
  })
  async activate(@Param('id') id: string) {
    const gameSystem = await this.gameSystemsService.activate(id);
    return gameSystem.toResponse();
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a game system' })
  @ApiParam({ name: 'id', description: 'Game system ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Game system deactivated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Game system not found',
    type: ErrorResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Cannot deactivate - system in use',
    type: ErrorResponse
  })
  async deactivate(@Param('id') id: string) {
    const gameSystem = await this.gameSystemsService.deactivate(id);
    return gameSystem.toResponse();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a game system' })
  @ApiParam({ name: 'id', description: 'Game system ID' })
  @ApiResponse({ 
    status: 204, 
    description: 'Game system deleted successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Game system not found',
    type: ErrorResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Cannot delete - system in use',
    type: ErrorResponse
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.gameSystemsService.delete(id);
  }
}