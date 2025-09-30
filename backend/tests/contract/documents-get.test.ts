import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('GET /api/documents/:id (Contract)', () => {
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

  it('should return document metadata with relationships', async () => {
    const documentId = 'test-document-id';

    const response = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: documentId,
      gameSystemId: expect.any(String),
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
      gameSystem: expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
      }),
      uploader: expect.objectContaining({
        id: expect.any(String),
        username: expect.any(String),
        displayName: expect.any(String),
      }),
      previousVersions: expect.any(Array),
    });
  });

  it('should include validation errors for invalid documents', async () => {
    const documentId = 'invalid-document-id';

    const response = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}`)
      .expect(200);

    if (response.body.validationErrors.length > 0) {
      expect(response.body.validationErrors).toEqual(
        expect.arrayContaining([expect.any(String)])
      );
    }
  });

  it('should return 404 for non-existent document', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    const response = await request(app.getHttpServer())
      .get(`/api/documents/${fakeId}`)
      .expect(404);

    expect(response.body).toMatchObject({
      error: 'Not Found',
      message: expect.any(String),
      statusCode: 404,
    });
  });

  it('should validate UUID format', async () => {
    await request(app.getHttpServer())
      .get('/api/documents/invalid-uuid')
      .expect(400);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/documents/test-id')
      .expect(401);
  });

  it('should include previous versions when available', async () => {
    const documentId = 'versioned-document-id';

    const response = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}`)
      .expect(200);

    expect(response.body.previousVersions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          version: expect.any(Number),
          isActive: false,
          createdAt: expect.any(String),
        })
      ])
    );
  });
});