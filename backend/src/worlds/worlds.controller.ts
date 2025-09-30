import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { WorldsService } from './worlds.service';
import { CreateWorldRequest, UpdateWorldRequest, WorldResponse, ErrorResponse } from './dto';

@ApiTags('worlds')
@Controller('api/worlds')
export class WorldsController {
  constructor(private readonly worldsService: WorldsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all worlds for homepage display' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of worlds with embedded game system info',
    type: [WorldResponse]
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error',
    type: ErrorResponse
  })
  async findAll(): Promise<WorldResponse[]> {
    return await this.worldsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new world' })
  @ApiBody({ 
    type: CreateWorldRequest,
    description: 'World creation data'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'World created successfully',
    type: WorldResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error',
    type: ErrorResponse
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error',
    type: ErrorResponse
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) 
    createWorldRequest: CreateWorldRequest
  ): Promise<WorldResponse> {
    return await this.worldsService.create(createWorldRequest);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific world by ID' })
  @ApiParam({ name: 'id', description: 'World ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'World found',
    type: WorldResponse
  })
  @ApiResponse({ 
    status: 404, 
    description: 'World not found',
    type: ErrorResponse
  })
  async findOne(@Param('id') id: string): Promise<WorldResponse> {
    const world = await this.worldsService.findById(id);
    
    // Convert to response format (would need game system data)
    // This is a simplified version - in reality we'd join with game system
    return {
      id: world.id,
      name: world.name,
      imageUrl: world.imageUrl,
      gameSystem: {
        id: world.gameSystemId,
        name: 'Unknown', // Would be fetched from game system
        defaultImageUrl: 'https://example.com/default.jpg'
      },
      lastAccessedAt: world.lastAccessedAt.toISOString(),
      createdAt: world.createdAt.toISOString()
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a world' })
  @ApiParam({ name: 'id', description: 'World ID' })
  @ApiBody({ 
    type: UpdateWorldRequest,
    description: 'World update data'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'World updated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'World not found',
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
    updateWorldRequest: UpdateWorldRequest
  ) {
    return await this.worldsService.update(id, updateWorldRequest);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a world' })
  @ApiParam({ name: 'id', description: 'World ID' })
  @ApiResponse({ 
    status: 204, 
    description: 'World deleted successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'World not found',
    type: ErrorResponse
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.worldsService.delete(id);
  }
}