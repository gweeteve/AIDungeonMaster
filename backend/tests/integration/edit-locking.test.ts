import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Edit Locking Workflow (Integration)', () => {
  let app: INestApplication;
  let gameSystemId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a game system for testing
    const systemResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send({
        name: 'Edit Lock Test System',
        description: 'System for testing edit locking functionality',
      })
      .expect(201);

    gameSystemId = systemResponse.body.id;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should complete the full edit locking workflow', async () => {
    // Step 1: Verify system is initially unlocked
    const initialResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}`)
      .expect(200);

    expect(initialResponse.body).toMatchObject({
      editLockUserId: null,
      editLockExpiresAt: null,
    });

    // Step 2: Acquire edit lock
    const lockResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/lock`)
      .expect(200);

    expect(lockResponse.body).toMatchObject({
      gameSystemId: gameSystemId,
      lockedBy: expect.any(String),
      expiresAt: expect.any(String),
      acquiredAt: expect.any(String),
    });

    const lockExpiresAt = new Date(lockResponse.body.expiresAt);
    const lockAcquiredAt = new Date(lockResponse.body.acquiredAt);
    const now = new Date();

    // Verify lock expiration is in the future
    expect(lockExpiresAt.getTime()).toBeGreaterThan(now.getTime());
    
    // Verify acquired time is recent
    expect(Math.abs(lockAcquiredAt.getTime() - now.getTime())).toBeLessThan(5000);

    // Step 3: Verify system shows as locked
    const lockedResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}`)
      .expect(200);

    expect(lockedResponse.body).toMatchObject({
      editLockUserId: expect.any(String),
      editLockExpiresAt: expect.any(String),
    });

    // Step 4: Verify edit operations work while locked by same user
    const editResponse = await request(app.getHttpServer())
      .put(`/api/game-systems/${gameSystemId}`)
      .send({ name: 'Edited While Locked' })
      .expect(200);

    expect(editResponse.body.name).toBe('Edited While Locked');

    // Step 5: Verify document upload works while locked by same user
    const uploadResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', Buffer.from('{"test": true}'), 'test.json')
      .field('displayName', 'Test Document')
      .expect(201);

    expect(uploadResponse.body.displayName).toBe('Test Document');

    // Step 6: Simulate different user trying to acquire lock (should fail)
    // Note: In a real implementation, this would use different authentication
    const conflictResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/lock`)
      .set('X-Test-User-Id', 'different-user-id') // Mock different user
      .expect(409);

    expect(conflictResponse.body.message).toContain('already locked');

    // Step 7: Simulate different user trying to edit (should fail)
    const blockedEditResponse = await request(app.getHttpServer())
      .put(`/api/game-systems/${gameSystemId}`)
      .set('X-Test-User-Id', 'different-user-id')
      .send({ name: 'Should Fail' })
      .expect(409);

    expect(blockedEditResponse.body.message).toContain('locked');

    // Step 8: Simulate different user trying to upload (should fail)
    const blockedUploadResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .set('X-Test-User-Id', 'different-user-id')
      .attach('file', Buffer.from('{"blocked": true}'), 'blocked.json')
      .field('displayName', 'Blocked Document')
      .expect(409);

    expect(blockedUploadResponse.body.message).toContain('locked');

    // Step 9: Release the lock
    await request(app.getHttpServer())
      .delete(`/api/game-systems/${gameSystemId}/lock`)
      .expect(204);

    // Step 10: Verify system is unlocked
    const unlockedResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}`)
      .expect(200);

    expect(unlockedResponse.body).toMatchObject({
      editLockUserId: null,
      editLockExpiresAt: null,
    });

    // Step 11: Verify other users can now edit
    const newUserEditResponse = await request(app.getHttpServer())
      .put(`/api/game-systems/${gameSystemId}`)
      .set('X-Test-User-Id', 'different-user-id')
      .send({ name: 'Edited by Different User' })
      .expect(200);

    expect(newUserEditResponse.body.name).toBe('Edited by Different User');
  });

  it('should handle lock expiration automatically', async () => {
    // Acquire a lock with very short expiration (for testing)
    const lockResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/lock`)
      .send({ expirationMinutes: 0.1 }) // 6 seconds for testing
      .expect(200);

    // Wait for lock to expire
    await new Promise(resolve => setTimeout(resolve, 7000));

    // Verify expired lock allows new operations
    const editResponse = await request(app.getHttpServer())
      .put(`/api/game-systems/${gameSystemId}`)
      .set('X-Test-User-Id', 'different-user-id')
      .send({ name: 'Edit After Expiration' })
      .expect(200);

    expect(editResponse.body.name).toBe('Edit After Expiration');
  });

  it('should allow same user to re-acquire existing lock', async () => {
    // Acquire initial lock
    const firstLockResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/lock`)
      .expect(200);

    const firstLockTime = new Date(firstLockResponse.body.acquiredAt);

    // Small delay to differentiate timestamps
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Re-acquire lock (should extend/refresh)
    const secondLockResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/lock`)
      .expect(200);

    const secondLockTime = new Date(secondLockResponse.body.acquiredAt);

    expect(secondLockTime.getTime()).toBeGreaterThan(firstLockTime.getTime());
    expect(secondLockResponse.body.gameSystemId).toBe(gameSystemId);
  });

  it('should handle lock release by unauthorized user', async () => {
    // User A acquires lock
    await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/lock`)
      .expect(200);

    // User B tries to release lock (should fail)
    const unauthorizedReleaseResponse = await request(app.getHttpServer())
      .delete(`/api/game-systems/${gameSystemId}/lock`)
      .set('X-Test-User-Id', 'different-user-id')
      .expect(403);

    expect(unauthorizedReleaseResponse.body.message).toContain('not authorized');

    // Verify lock is still held
    const stillLockedResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}`)
      .expect(200);

    expect(stillLockedResponse.body.editLockUserId).not.toBeNull();
  });

  it('should handle multiple rapid lock attempts', async () => {
    // Simulate multiple rapid lock attempts from same user
    const lockPromises = Array.from({ length: 5 }, () =>
      request(app.getHttpServer())
        .post(`/api/game-systems/${gameSystemId}/lock`)
    );

    const responses = await Promise.all(lockPromises);

    // All should succeed (idempotent for same user)
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.gameSystemId).toBe(gameSystemId);
    });
  });

  it('should integrate locking with document operations', async () => {
    // Acquire lock
    await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/lock`)
      .expect(200);

    // Upload document while locked
    const uploadResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', Buffer.from('{"test": "data"}'), 'locked-upload.json')
      .field('displayName', 'Locked Upload Test')
      .expect(201);

    const documentId = uploadResponse.body.id;

    // Update document while system locked
    await request(app.getHttpServer())
      .put(`/api/documents/${documentId}`)
      .send({ displayName: 'Updated While Locked' })
      .expect(200);

    // Delete document while system locked
    await request(app.getHttpServer())
      .delete(`/api/documents/${documentId}`)
      .expect(204);

    // Release lock
    await request(app.getHttpServer())
      .delete(`/api/game-systems/${gameSystemId}/lock`)
      .expect(204);

    // Verify document operations work after unlock
    await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', Buffer.from('{"unlocked": true}'), 'unlocked.json')
      .field('displayName', 'Unlocked Upload')
      .expect(201);
  });
});