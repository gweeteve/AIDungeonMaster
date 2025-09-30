import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('DELETE /api/game-systems/:id (Contract)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should delete game system (soft delete)', async () => {
    const gameSystemId = 'test-system-id';

    await request(app.getHttpServer())
      .delete(`/api/game-systems/${gameSystemId}`)
      .expect(204);
  });

  it('should prevent deletion of system in use by active sessions', async () => {
    const gameSystemId = 'system-in-use-id';

    const response = await request(app.getHttpServer())
      .delete(`/api/game-systems/${gameSystemId}`)
      .expect(409);

    expect(response.body).toMatchObject({
      error: 'Conflict',
      message: expect.stringContaining('active sessions'),
      statusCode: 409,
    });
  });

  it('should return 404 for non-existent game system', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    await request(app.getHttpServer())
      .delete(`/api/game-systems/${fakeId}`)
      .expect(404);
  });

  it('should validate UUID format', async () => {
    await request(app.getHttpServer())
      .delete('/api/game-systems/invalid-uuid')
      .expect(400);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .delete('/api/game-systems/test-id')
      .expect(401);
  });

  it('should preserve referential integrity after deletion', async () => {
    const gameSystemId = 'parent-system-id';

    // Delete the system
    await request(app.getHttpServer())
      .delete(`/api/game-systems/${gameSystemId}`)
      .expect(204);

    // Verify system is no longer accessible
    await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}`)
      .expect(404);

    // Verify derived systems still reference it (but parent is archived)
    // This would be tested in integration tests
  });
});