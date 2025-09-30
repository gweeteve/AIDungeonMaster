import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('POST /api/game-systems/:id/documents (Contract)', () => {
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

  it('should upload a JSON document successfully', async () => {
    const gameSystemId = 'test-system-id';
    const testJson = { spell: { name: 'Fireball', level: 3 } };
    const jsonBuffer = Buffer.from(JSON.stringify(testJson));

    const response = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', jsonBuffer, 'fireball.json')
      .field('displayName', 'Fireball Spell')
      .field('tags', 'spells,combat')
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      gameSystemId: gameSystemId,
      displayName: 'Fireball Spell',
      filename: 'fireball.json',
      type: 'JSON',
      fileSize: expect.any(Number),
      mimeType: 'application/json',
      uploadedBy: expect.any(String),
      checksum: expect.any(String),
      validationErrors: [],
      tags: expect.arrayContaining(['spells', 'combat']),
      version: 1,
      isActive: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('should upload a PDF document successfully', async () => {
    const gameSystemId = 'test-system-id';
    // Create a minimal PDF buffer for testing
    const pdfBuffer = Buffer.from('%PDF-1.4\\n%EOF');

    const response = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', pdfBuffer, 'monsters.pdf')
      .field('displayName', 'Monster Manual')
      .field('tags', 'monsters,bestiary')
      .expect(201);

    expect(response.body).toMatchObject({
      displayName: 'Monster Manual',
      filename: 'monsters.pdf',
      type: 'PDF',
      mimeType: 'application/pdf',
      tags: expect.arrayContaining(['monsters', 'bestiary']),
    });
  });

  it('should upload a Markdown document successfully', async () => {
    const gameSystemId = 'test-system-id';
    const markdownContent = '# Character Classes\\n\\n## Fighter\\nA warrior class...';
    const mdBuffer = Buffer.from(markdownContent);

    const response = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', mdBuffer, 'classes.md')
      .field('displayName', 'Character Classes')
      .field('tags', 'classes,character-creation')
      .expect(201);

    expect(response.body).toMatchObject({
      displayName: 'Character Classes',
      filename: 'classes.md',
      type: 'MARKDOWN',
      mimeType: 'text/markdown',
    });
  });

  it('should reject invalid JSON documents', async () => {
    const gameSystemId = 'test-system-id';
    const invalidJson = Buffer.from('{ invalid json content');

    const response = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', invalidJson, 'invalid.json')
      .field('displayName', 'Invalid JSON')
      .expect(422);

    expect(response.body).toMatchObject({
      statusCode: 422,
      error: 'Unprocessable Entity',
      validationErrors: expect.arrayContaining([
        expect.objectContaining({
          field: 'file',
          message: expect.stringContaining('Invalid JSON'),
        })
      ]),
    });
  });

  it('should reject unsupported file types', async () => {
    const gameSystemId = 'test-system-id';
    const txtBuffer = Buffer.from('Plain text content');

    await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', txtBuffer, 'unsupported.txt')
      .field('displayName', 'Text File')
      .expect(422);
  });

  it('should reject duplicate document names', async () => {
    const gameSystemId = 'test-system-id';
    const jsonBuffer = Buffer.from('{"duplicate": true}');

    await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', jsonBuffer, 'duplicate.json')
      .field('displayName', 'Existing Document Name')
      .expect(409);
  });

  it('should reject uploads when system is locked', async () => {
    const gameSystemId = 'locked-system-id';
    const jsonBuffer = Buffer.from('{"test": true}');

    const response = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', jsonBuffer, 'test.json')
      .field('displayName', 'Should Fail')
      .expect(409);

    expect(response.body.message).toContain('locked');
  });

  it('should require authentication', async () => {
    const jsonBuffer = Buffer.from('{"test": true}');

    await request(app.getHttpServer())
      .post('/api/game-systems/test-id/documents')
      .attach('file', jsonBuffer, 'test.json')
      .field('displayName', 'Test')
      .expect(401);
  });
});