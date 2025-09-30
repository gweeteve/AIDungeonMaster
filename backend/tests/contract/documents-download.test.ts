import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('GET /api/documents/:id/download (Contract)', () => {
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

  it('should download JSON document content', async () => {
    const documentId = 'json-document-id';

    const response = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/download`)
      .expect(200);

    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.headers['content-disposition']).toMatch(/attachment; filename=/);
    
    // Verify it's valid JSON
    expect(() => JSON.parse(response.text)).not.toThrow();
    
    // Basic structure validation
    expect(response.body).toEqual(expect.any(Object));
  });

  it('should download PDF document content', async () => {
    const documentId = 'pdf-document-id';

    const response = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/download`)
      .expect(200);

    expect(response.headers['content-type']).toMatch(/application\/pdf/);
    expect(response.headers['content-disposition']).toMatch(/attachment; filename=.*\\.pdf/);
    
    // Verify PDF signature
    expect(response.body.toString('utf8', 0, 4)).toBe('%PDF');
  });

  it('should download Markdown document content', async () => {
    const documentId = 'markdown-document-id';

    const response = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/download`)
      .expect(200);

    expect(response.headers['content-type']).toMatch(/text\/markdown/);
    expect(response.headers['content-disposition']).toMatch(/attachment; filename=.*\\.md/);
    
    // Verify it's text content
    expect(typeof response.text).toBe('string');
  });

  it('should include proper cache headers', async () => {
    const documentId = 'test-document-id';

    const response = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/download`)
      .expect(200);

    // Should include ETag for caching
    expect(response.headers['etag']).toBeDefined();
    
    // Should include Content-Length
    expect(response.headers['content-length']).toBeDefined();
    expect(parseInt(response.headers['content-length'])).toBeGreaterThan(0);
  });

  it('should support conditional requests with If-None-Match', async () => {
    const documentId = 'test-document-id';

    // First request to get ETag
    const firstResponse = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/download`)
      .expect(200);

    const etag = firstResponse.headers['etag'];

    // Second request with If-None-Match should return 304
    await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/download`)
      .set('If-None-Match', etag)
      .expect(304);
  });

  it('should return 404 for non-existent document', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    const response = await request(app.getHttpServer())
      .get(`/api/documents/${fakeId}/download`)
      .expect(404);

    expect(response.body).toMatchObject({
      error: 'Not Found',
      message: expect.any(String),
      statusCode: 404,
    });
  });

  it('should validate UUID format', async () => {
    await request(app.getHttpServer())
      .get('/api/documents/invalid-uuid/download')
      .expect(400);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/documents/test-id/download')
      .expect(401);
  });

  it('should handle corrupted files gracefully', async () => {
    const documentId = 'corrupted-document-id';

    const response = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/download`)
      .expect(500);

    expect(response.body).toMatchObject({
      error: 'Internal Server Error',
      message: expect.stringContaining('file'),
      statusCode: 500,
    });
  });
});