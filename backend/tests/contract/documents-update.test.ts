import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('PUT /api/documents/:id (Contract)', () => {
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

  it('should update document metadata', async () => {
    const documentId = 'test-document-id';
    const updateRequest = {
      displayName: 'Updated Document Name',
      tags: ['updated', 'tags', 'test'],
    };

    const response = await request(app.getHttpServer())
      .put(`/api/documents/${documentId}`)
      .send(updateRequest)
      .expect(200);

    expect(response.body).toMatchObject({
      id: documentId,
      displayName: updateRequest.displayName,
      tags: updateRequest.tags,
      updatedAt: expect.any(String),
    });

    // Verify updatedAt timestamp is recent
    const updatedAt = new Date(response.body.updatedAt);
    const now = new Date();
    expect(Math.abs(updatedAt.getTime() - now.getTime())).toBeLessThan(10000);
  });

  it('should update only provided fields', async () => {
    const documentId = 'test-document-id';
    const updateRequest = {
      displayName: 'New Name Only',
    };

    const response = await request(app.getHttpServer())
      .put(`/api/documents/${documentId}`)
      .send(updateRequest)
      .expect(200);

    expect(response.body).toMatchObject({
      id: documentId,
      displayName: updateRequest.displayName,
      tags: expect.any(Array), // Should retain existing tags
    });
  });

  it('should reject updates when game system is locked', async () => {
    const documentId = 'locked-system-document-id';

    const response = await request(app.getHttpServer())
      .put(`/api/documents/${documentId}`)
      .send({ displayName: 'Should Fail' })
      .expect(409);

    expect(response.body).toMatchObject({
      error: 'Conflict',
      message: expect.stringContaining('locked'),
      statusCode: 409,
    });
  });

  it('should reject invalid update data', async () => {
    const documentId = 'test-document-id';
    const invalidRequest = {
      displayName: '', // Invalid: empty name
      tags: 'not-an-array', // Invalid: should be array
    };

    const response = await request(app.getHttpServer())
      .put(`/api/documents/${documentId}`)
      .send(invalidRequest)
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      validationErrors: expect.arrayContaining([
        expect.objectContaining({
          field: expect.any(String),
          message: expect.any(String),
        })
      ]),
    });
  });

  it('should prevent name conflicts within same game system', async () => {
    const documentId = 'test-document-id';
    const conflictRequest = {
      displayName: 'Existing Document Name',
    };

    const response = await request(app.getHttpServer())
      .put(`/api/documents/${documentId}`)
      .send(conflictRequest)
      .expect(409);

    expect(response.body).toMatchObject({
      error: 'Conflict',
      message: expect.stringContaining('name already exists'),
      statusCode: 409,
    });
  });

  it('should return 404 for non-existent document', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    await request(app.getHttpServer())
      .put(`/api/documents/${fakeId}`)
      .send({ displayName: 'Updated Name' })
      .expect(404);
  });

  it('should validate UUID format', async () => {
    await request(app.getHttpServer())
      .put('/api/documents/invalid-uuid')
      .send({ displayName: 'Updated Name' })
      .expect(400);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .put('/api/documents/test-id')
      .send({ displayName: 'Updated Name' })
      .expect(401);
  });
});