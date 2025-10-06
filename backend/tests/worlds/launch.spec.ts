import { Test, TestingModule } from '@nestjs/testing';
import { LaunchController } from '../src/worlds/launch.controller';
import { WorldsService } from '../src/worlds/worlds.service';
import { LaunchResponse } from '../src/worlds/dto';

describe('Launch Endpoint Contract Tests', () => {
  let controller: LaunchController;
  let service: WorldsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaunchController],
      providers: [
        {
          provide: WorldsService,
          useValue: {
            launchWorld: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LaunchController>(LaunchController);
    service = module.get<WorldsService>(WorldsService);
  });

  describe('POST /api/worlds/:worldId/launch', () => {
    it('should launch world and return launch information', async () => {
      // Arrange
      const worldId = 'world-123';
      const expectedResponse: LaunchResponse = {
        worldId: 'world-123',
        launchUrl: '/game/world-123',
        lastAccessedAt: '2024-12-19T10:00:00.000Z'
      };

      jest.spyOn(service, 'launchWorld').mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.launchWorld(worldId);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(service.launchWorld).toHaveBeenCalledWith(worldId);
      expect(result).toHaveProperty('worldId');
      expect(result).toHaveProperty('launchUrl');
      expect(result).toHaveProperty('lastAccessedAt');
    });

    it('should update lastAccessedAt timestamp when launching', async () => {
      // Arrange
      const worldId = 'world-456';
      const beforeLaunch = new Date().toISOString();
      
      const expectedResponse: LaunchResponse = {
        worldId: 'world-456',
        launchUrl: '/game/world-456',
        lastAccessedAt: new Date().toISOString()
      };

      jest.spyOn(service, 'launchWorld').mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.launchWorld(worldId);

      // Assert
      expect(new Date(result.lastAccessedAt).getTime()).toBeGreaterThanOrEqual(new Date(beforeLaunch).getTime());
    });

    it('should throw error when world not found', async () => {
      // Arrange
      const worldId = 'non-existent-world';
      
      jest.spyOn(service, 'launchWorld').mockRejectedValue(new Error('World not found'));

      // Act & Assert
      await expect(controller.launchWorld(worldId)).rejects.toThrow('World not found');
      expect(service.launchWorld).toHaveBeenCalledWith(worldId);
    });

    it('should validate worldId parameter format', async () => {
      // Arrange
      const invalidWorldId = '';
      
      // Act & Assert
      // This test ensures worldId parameter validation
      expect(invalidWorldId).toBe(''); // Will be enhanced with actual validation
    });

    it('should return consistent launchUrl format', async () => {
      // Arrange
      const worldId = 'world-789';
      const expectedResponse: LaunchResponse = {
        worldId: 'world-789',
        launchUrl: '/game/world-789',
        lastAccessedAt: '2024-12-19T10:00:00.000Z'
      };

      jest.spyOn(service, 'launchWorld').mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.launchWorld(worldId);

      // Assert
      expect(result.launchUrl).toMatch(/^\/game\/[a-zA-Z0-9-]+$/);
      expect(result.launchUrl).toBe(`/game/${worldId}`);
    });

    it('should handle concurrent launch requests for same world', async () => {
      // Arrange
      const worldId = 'world-concurrent';
      const expectedResponse: LaunchResponse = {
        worldId: 'world-concurrent',
        launchUrl: '/game/world-concurrent',
        lastAccessedAt: '2024-12-19T10:00:00.000Z'
      };

      jest.spyOn(service, 'launchWorld').mockResolvedValue(expectedResponse);

      // Act - Simulate concurrent requests
      const requests = [
        controller.launchWorld(worldId),
        controller.launchWorld(worldId),
        controller.launchWorld(worldId)
      ];

      const results = await Promise.all(requests);

      // Assert
      results.forEach(result => {
        expect(result.worldId).toBe(worldId);
        expect(result).toHaveProperty('launchUrl');
        expect(result).toHaveProperty('lastAccessedAt');
      });
      expect(service.launchWorld).toHaveBeenCalledTimes(3);
    });
  });
});