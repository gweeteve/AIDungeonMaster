import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('DELETE /api/game-systems/:id/lock (Contract)', () => {
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

  it('should release edit lock successfully', async () => {
    const gameSystemId = 'locked-system-id';

    await request(app.getHttpServer())
      .delete(`/api/game-systems/${gameSystemId}/lock`)
      .expect(204);
  });

  it('should handle release of non-existent lock gracefully', async () => {
    const gameSystemId = 'unlocked-system-id';

    // Should succeed even if no lock exists (idempotent operation)
    await request(app.getHttpServer())
      .delete(`/api/game-systems/${gameSystemId}/lock`)
      .expect(204);
  });

  it('should prevent other users from releasing lock', async () => {
    const gameSystemId = 'other-user-locked-system-id';

    const response = await request(app.getHttpServer())
      .delete(`/api/game-systems/${gameSystemId}/lock`)
      .expect(403);

    expect(response.body).toMatchObject({
      error: 'Forbidden',
      message: expect.stringContaining('not authorized'),
      statusCode: 403,
    });
  });

  it('should return 404 for non-existent game system', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    await request(app.getHttpServer())
      .delete(`/api/game-systems/${fakeId}/lock`)
      .expect(404);
  });

  it('should validate UUID format', async () => {
    await request(app.getHttpServer())
      .delete('/api/game-systems/invalid-uuid/lock')
      .expect(400);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .delete('/api/game-systems/test-id/lock')
      .expect(401);
  });

  it('should automatically release expired locks', async () => {
    const gameSystemId = 'expired-lock-system-id';

    // Even if lock is expired, release should succeed
    await request(app.getHttpServer())
      .delete(`/api/game-systems/${gameSystemId}/lock`)
      .expect(204);
  });
});