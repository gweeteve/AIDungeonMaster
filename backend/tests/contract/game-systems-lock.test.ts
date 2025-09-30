import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('POST /api/game-systems/:id/lock (Contract)', () => {
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

  it('should acquire edit lock successfully', async () => {
    const gameSystemId = 'test-system-id';

    const response = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/lock`)
      .expect(200);

    expect(response.body).toMatchObject({
      gameSystemId: gameSystemId,
      lockedBy: expect.any(String),
      expiresAt: expect.any(String),
      acquiredAt: expect.any(String),
    });

    // Verify the expiration date is in the future
    const expiresAt = new Date(response.body.expiresAt);
    const now = new Date();
    expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());

    // Verify acquired date is recent
    const acquiredAt = new Date(response.body.acquiredAt);
    expect(Math.abs(acquiredAt.getTime() - now.getTime())).toBeLessThan(10000); // Within 10 seconds
  });

  it('should prevent duplicate locks', async () => {
    const gameSystemId = 'already-locked-system-id';

    const response = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/lock`)
      .expect(409);

    expect(response.body).toMatchObject({
      error: 'Conflict',
      message: expect.stringContaining('already locked'),
      statusCode: 409,
    });
  });

  it('should return 404 for non-existent game system', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    await request(app.getHttpServer())
      .post(`/api/game-systems/${fakeId}/lock`)
      .expect(404);
  });

  it('should validate UUID format', async () => {
    await request(app.getHttpServer())
      .post('/api/game-systems/invalid-uuid/lock')
      .expect(400);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/game-systems/test-id/lock')
      .expect(401);
  });

  it('should allow same user to re-acquire existing lock', async () => {
    const gameSystemId = 'user-locked-system-id';

    // Should succeed if current user already holds the lock
    const response = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/lock`)
      .expect(200);

    expect(response.body).toMatchObject({
      gameSystemId: gameSystemId,
      lockedBy: expect.any(String),
    });
  });
});