import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app';

describe('Game Systems API Contract Tests', () => {
  let authToken: string;
  let gameSystemId: string;

  beforeAll(async () => {
    // Setup test authentication
    authToken = await getTestAuthToken();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  describe('POST /api/game-systems', () => {
    it('should create a new game system with valid data', async () => {
      const createRequest = {
        name: 'Test D&D System',
        description: 'A test game system for D&D',
        syncWithParent: true
      };

      const response = await request(app)
        .post('/api/game-systems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRequest)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: createRequest.name,
        description: createRequest.description,
        ownerId: expect.any(String),
        isPublic: expect.any(Boolean),
        syncWithParent: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });

      gameSystemId = response.body.id;
    });

    it('should create a derived game system', async () => {
      const deriveRequest = {
        name: 'Derived Test System',
        parentSystemId: gameSystemId,
        syncWithParent: false
      };

      const response = await request(app)
        .post('/api/game-systems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deriveRequest)
        .expect(201);

      expect(response.body).toMatchObject({
        name: deriveRequest.name,
        parentSystemId: gameSystemId,
        syncWithParent: false
      });
    });

    it('should reject invalid game system data', async () => {
      const invalidRequest = {
        name: '', // Invalid: empty name
        description: 'x'.repeat(501) // Invalid: too long
      };

      await request(app)
        .post('/api/game-systems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);
    });

    it('should reject duplicate game system names for same user', async () => {
      const duplicateRequest = {
        name: 'Test D&D System' // Same name as first test
      };

      await request(app)
        .post('/api/game-systems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateRequest)
        .expect(409);
    });
  });

  describe('GET /api/game-systems', () => {
    it('should return paginated list of game systems', async () => {
      const response = await request(app)
        .get('/api/game-systems?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            ownerId: expect.any(String)
          })
        ]),
        pagination: {
          page: 1,
          limit: 10,
          total: expect.any(Number),
          totalPages: expect.any(Number)
        }
      });
    });

    it('should filter game systems by search term', async () => {
      const response = await request(app)
        .get('/api/game-systems?search=Test D&D')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringContaining('Test D&D')
          })
        ])
      );
    });
  });

  describe('GET /api/game-systems/:id', () => {
    it('should return game system details with relationships', async () => {
      const response = await request(app)
        .get(`/api/game-systems/${gameSystemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: gameSystemId,
        name: expect.any(String),
        documents: expect.any(Array),
        derivedSystems: expect.any(Array)
      });
    });

    it('should return 404 for non-existent game system', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      
      await request(app)
        .get(`/api/game-systems/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/game-systems/:id', () => {
    it('should update game system metadata', async () => {
      const updateRequest = {
        name: 'Updated Test System',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/game-systems/${gameSystemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body).toMatchObject({
        id: gameSystemId,
        name: updateRequest.name,
        description: updateRequest.description
      });
    });

    it('should reject updates when system is locked', async () => {
      // First, acquire lock with different user
      const otherToken = await getOtherUserToken();
      await request(app)
        .post(`/api/game-systems/${gameSystemId}/lock`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      // Try to update with original user
      await request(app)
        .put(`/api/game-systems/${gameSystemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Should Fail' })
        .expect(409);

      // Release lock
      await request(app)
        .delete(`/api/game-systems/${gameSystemId}/lock`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(204);
    });
  });

  describe('Edit Lock Operations', () => {
    it('should acquire and release edit locks', async () => {
      // Acquire lock
      const lockResponse = await request(app)
        .post(`/api/game-systems/${gameSystemId}/lock`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(lockResponse.body).toMatchObject({
        gameSystemId: gameSystemId,
        lockedBy: expect.any(String),
        expiresAt: expect.any(String),
        acquiredAt: expect.any(String)
      });

      // Release lock
      await request(app)
        .delete(`/api/game-systems/${gameSystemId}/lock`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should prevent duplicate locks', async () => {
      // Acquire lock
      await request(app)
        .post(`/api/game-systems/${gameSystemId}/lock`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to acquire again
      await request(app)
        .post(`/api/game-systems/${gameSystemId}/lock`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      // Release lock
      await request(app)
        .delete(`/api/game-systems/${gameSystemId}/lock`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('DELETE /api/game-systems/:id', () => {
    it('should delete game system (soft delete)', async () => {
      await request(app)
        .delete(`/api/game-systems/${gameSystemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify system is no longer accessible
      await request(app)
        .get(`/api/game-systems/${gameSystemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

// Helper functions
async function getTestAuthToken(): Promise<string> {
  // Implementation would create test user and return JWT
  throw new Error('Test helper not implemented');
}

async function getOtherUserToken(): Promise<string> {
  // Implementation would create different test user and return JWT
  throw new Error('Test helper not implemented');
}

async function cleanupTestData(): Promise<void> {
  // Implementation would clean up test data
  throw new Error('Test helper not implemented');
}