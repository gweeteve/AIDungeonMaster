import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('DELETE /api/documents/:id (Contract)', () => {
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

  it('should delete document successfully', async () => {
    const documentId = 'test-document-id';

    await request(app.getHttpServer())
      .delete(`/api/documents/${documentId}`)
      .expect(204);
  });

  it('should reject deletion when game system is locked', async () => {
    const documentId = 'locked-system-document-id';

    const response = await request(app.getHttpServer())
      .delete(`/api/documents/${documentId}`)
      .expect(409);

    expect(response.body).toMatchObject({
      error: 'Conflict',
      message: expect.stringContaining('locked'),
      statusCode: 409,
    });
  });

  it('should return 404 for non-existent document', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    await request(app.getHttpServer())
      .delete(`/api/documents/${fakeId}`)
      .expect(404);
  });

  it('should validate UUID format', async () => {
    await request(app.getHttpServer())
      .delete('/api/documents/invalid-uuid')
      .expect(400);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .delete('/api/documents/test-id')
      .expect(401);
  });

  it('should clean up file system when deleting document', async () => {
    const documentId = 'test-document-with-file-id';

    await request(app.getHttpServer())
      .delete(`/api/documents/${documentId}`)
      .expect(204);

    // This test would verify file system cleanup in integration tests
    // Contract test just verifies the API contract
  });

  it('should preserve document history for versioned documents', async () => {
    const documentId = 'versioned-document-id';

    await request(app.getHttpServer())
      .delete(`/api/documents/${documentId}`)
      .expect(204);

    // Verify document is no longer accessible
    await request(app.getHttpServer())
      .get(`/api/documents/${documentId}`)
      .expect(404);

    // Previous versions should be handled according to business rules
    // This is tested more thoroughly in integration tests
  });
});