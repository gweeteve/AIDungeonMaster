import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('GET /api/game-systems/:id/documents (Contract)', () => {
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

  it('should list all documents in a game system', async () => {
    const gameSystemId = 'test-system-id';

    const response = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}/documents`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          gameSystemId: gameSystemId,
          displayName: expect.any(String),
          filename: expect.any(String),
          type: expect.stringMatching(/^(JSON|PDF|MARKDOWN)$/),
          fileSize: expect.any(Number),
          mimeType: expect.any(String),
          uploadedBy: expect.any(String),
          checksum: expect.any(String),
          validationErrors: expect.any(Array),
          tags: expect.any(Array),
          version: expect.any(Number),
          isActive: expect.any(Boolean),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      ])
    );
  });

  it('should filter documents by type', async () => {
    const gameSystemId = 'test-system-id';

    const response = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}/documents`)
      .query({ type: 'JSON' })
      .expect(200);

    response.body.forEach((doc: any) => {
      expect(doc.type).toBe('JSON');
    });
  });

  it('should filter documents by tags', async () => {
    const gameSystemId = 'test-system-id';

    const response = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}/documents`)
      .query({ tags: ['spells', 'combat'] })
      .expect(200);

    response.body.forEach((doc: any) => {
      expect(doc.tags).toEqual(
        expect.arrayContaining(['spells'])
      );
    });
  });

  it('should return empty array for system with no documents', async () => {
    const gameSystemId = 'empty-system-id';

    const response = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}/documents`)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('should return 404 for non-existent game system', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    await request(app.getHttpServer())
      .get(`/api/game-systems/${fakeId}/documents`)
      .expect(404);
  });

  it('should validate document type filter', async () => {
    const gameSystemId = 'test-system-id';

    await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}/documents`)
      .query({ type: 'INVALID' })
      .expect(400);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/game-systems/test-id/documents')
      .expect(401);
  });
});