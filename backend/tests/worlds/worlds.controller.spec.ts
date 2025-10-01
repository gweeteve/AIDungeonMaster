import { Test, TestingModule } from '@nestjs/testing';
import { WorldsController } from '../src/worlds/worlds.controller';
import { WorldsService } from '../src/worlds/worlds.service';
import { CreateWorldRequest, WorldResponse } from '../src/worlds/dto';

describe('WorldsController API Contract Tests', () => {
  let controller: WorldsController;
  let service: WorldsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorldsController],
      providers: [
        {
          provide: WorldsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WorldsController>(WorldsController);
    service = module.get<WorldsService>(WorldsService);
  });

  describe('GET /api/worlds', () => {
    it('should return array of worlds with embedded game system info', async () => {
      // Arrange
      const mockWorlds: WorldResponse[] = [
        {
          id: 'world-1',
          name: 'Test World',
          imageUrl: 'https://example.com/image.jpg',
          gameSystem: {
            id: 'system-1',
            name: 'D&D 5e',
            defaultImageUrl: 'https://example.com/dnd.jpg'
          },
          lastAccessedAt: '2024-12-19T10:00:00.000Z',
          createdAt: '2024-12-19T10:00:00.000Z'
        }
      ];
      
      jest.spyOn(service, 'findAll').mockResolvedValue(mockWorlds);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockWorlds);
      expect(service.findAll).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('gameSystem');
      expect(result[0].gameSystem).toHaveProperty('defaultImageUrl');
    });

    it('should return empty array when no worlds exist', async () => {
      // Arrange
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('POST /api/worlds', () => {
    it('should create and return a new world', async () => {
      // Arrange
      const createRequest: CreateWorldRequest = {
        name: 'New Adventure',
        gameSystemId: 'system-1',
        imageUrl: 'https://example.com/adventure.jpg'
      };

      const expectedResponse: WorldResponse = {
        id: 'new-world-id',
        name: 'New Adventure',
        imageUrl: 'https://example.com/adventure.jpg',
        gameSystem: {
          id: 'system-1',
          name: 'D&D 5e',
          defaultImageUrl: 'https://example.com/dnd.jpg'
        },
        lastAccessedAt: '2024-12-19T10:00:00.000Z',
        createdAt: '2024-12-19T10:00:00.000Z'
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.create(createRequest);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(service.create).toHaveBeenCalledWith(createRequest);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createRequest.name);
    });

    it('should handle world creation without image URL', async () => {
      // Arrange
      const createRequest: CreateWorldRequest = {
        name: 'Text Only World',
        gameSystemId: 'system-1'
      };

      const expectedResponse: WorldResponse = {
        id: 'new-world-id',
        name: 'Text Only World',
        gameSystem: {
          id: 'system-1',
          name: 'D&D 5e',
          defaultImageUrl: 'https://example.com/dnd.jpg'
        },
        lastAccessedAt: '2024-12-19T10:00:00.000Z',
        createdAt: '2024-12-19T10:00:00.000Z'
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.create(createRequest);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.imageUrl).toBeUndefined();
    });

    it('should validate world name length (1-255 characters)', async () => {
      // This test will fail until validation is implemented
      const invalidRequest: CreateWorldRequest = {
        name: '', // Empty name should fail
        gameSystemId: 'system-1'
      };

      // Act & Assert
      await expect(controller.create(invalidRequest)).rejects.toThrow();
    });

    it('should validate UTF-8 character support in world names', async () => {
      // Arrange
      const utf8Request: CreateWorldRequest = {
        name: 'Мой мир приключений 🎲🗡️', // Cyrillic + emojis
        gameSystemId: 'system-1'
      };

      const expectedResponse: WorldResponse = {
        id: 'utf8-world-id',
        name: 'Мой мир приключений 🎲🗡️',
        gameSystem: {
          id: 'system-1',
          name: 'D&D 5e',
          defaultImageUrl: 'https://example.com/dnd.jpg'
        },
        lastAccessedAt: '2024-12-19T10:00:00.000Z',
        createdAt: '2024-12-19T10:00:00.000Z'
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.create(utf8Request);

      // Assert
      expect(result.name).toBe(utf8Request.name);
    });
  });
});