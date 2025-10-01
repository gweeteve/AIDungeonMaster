import { Test, TestingModule } from '@nestjs/testing';
import { GameSystemsController } from '../src/game-systems/game-systems.controller';
import { GameSystemsService } from '../src/game-systems/game-systems.service';
import { GameSystemResponse } from '../src/game-systems/dto';

describe('GameSystemsController API Contract Tests', () => {
  let controller: GameSystemsController;
  let service: GameSystemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameSystemsController],
      providers: [
        {
          provide: GameSystemsService,
          useValue: {
            findAllActive: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GameSystemsController>(GameSystemsController);
    service = module.get<GameSystemsService>(GameSystemsService);
  });

  describe('GET /api/game-systems', () => {
    it('should return array of active game systems', async () => {
      // Arrange
      const mockGameSystems: GameSystemResponse[] = [
        {
          id: 'system-1',
          name: 'D&D 5e',
          defaultImageUrl: 'https://example.com/dnd5e.jpg',
          description: 'Dungeons & Dragons 5th Edition',
          isActive: true
        },
        {
          id: 'system-2',
          name: 'Pathfinder 2e',
          defaultImageUrl: 'https://example.com/pf2e.jpg',
          isActive: true
        }
      ];
      
      jest.spyOn(service, 'findAllActive').mockResolvedValue(mockGameSystems);

      // Act
      const result = await controller.findAllActive();

      // Assert
      expect(result).toEqual(mockGameSystems);
      expect(service.findAllActive).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
      expect(result.every(system => system.isActive)).toBe(true);
    });

    it('should return empty array when no active game systems exist', async () => {
      // Arrange
      jest.spyOn(service, 'findAllActive').mockResolvedValue([]);

      // Act
      const result = await controller.findAllActive();

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include required fields for each game system', async () => {
      // Arrange
      const mockGameSystems: GameSystemResponse[] = [
        {
          id: 'system-1',
          name: 'Test System',
          defaultImageUrl: 'https://example.com/test.jpg',
          isActive: true
        }
      ];
      
      jest.spyOn(service, 'findAllActive').mockResolvedValue(mockGameSystems);

      // Act
      const result = await controller.findAllActive();

      // Assert
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('defaultImageUrl');
      expect(result[0]).toHaveProperty('isActive');
      expect(typeof result[0].id).toBe('string');
      expect(typeof result[0].name).toBe('string');
      expect(typeof result[0].defaultImageUrl).toBe('string');
      expect(typeof result[0].isActive).toBe('boolean');
    });

    it('should handle optional description field', async () => {
      // Arrange
      const mockGameSystems: GameSystemResponse[] = [
        {
          id: 'system-1',
          name: 'System with Description',
          defaultImageUrl: 'https://example.com/test.jpg',
          description: 'A detailed description',
          isActive: true
        },
        {
          id: 'system-2',
          name: 'System without Description',
          defaultImageUrl: 'https://example.com/test2.jpg',
          isActive: true
        }
      ];
      
      jest.spyOn(service, 'findAllActive').mockResolvedValue(mockGameSystems);

      // Act
      const result = await controller.findAllActive();

      // Assert
      expect(result[0].description).toBeDefined();
      expect(result[1].description).toBeUndefined();
    });

    it('should validate defaultImageUrl format', async () => {
      // Arrange
      const mockGameSystems: GameSystemResponse[] = [
        {
          id: 'system-1',
          name: 'Test System',
          defaultImageUrl: 'https://valid-url.com/image.jpg',
          isActive: true
        }
      ];
      
      jest.spyOn(service, 'findAllActive').mockResolvedValue(mockGameSystems);

      // Act
      const result = await controller.findAllActive();

      // Assert
      expect(result[0].defaultImageUrl).toMatch(/^https?:\/\/.+/);
    });
  });
});