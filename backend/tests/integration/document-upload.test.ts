import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Document Upload and Validation Workflow (Integration)', () => {
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
        name: 'Document Test System',
        validationSchema: {
          type: 'object',
          properties: {
            spells: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  level: { type: 'number', minimum: 0, maximum: 9 },
                  school: { type: 'string' },
                },
                required: ['name', 'level', 'school'],
              },
            },
          },
          required: ['spells'],
        },
      })
      .expect(201);

    gameSystemId = systemResponse.body.id;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should complete the full document upload and validation workflow', async () => {
    // Step 1: Upload a valid JSON document
    const validSpellData = {
      spells: [
        {
          name: 'Fireball',
          level: 3,
          school: 'Evocation',
          damage: '8d6 fire',
          range: '150 feet',
        },
        {
          name: 'Magic Missile',
          level: 1,
          school: 'Evocation',
          damage: '1d4+1 force',
          range: '120 feet',
        },
      ],
    };

    const jsonBuffer = Buffer.from(JSON.stringify(validSpellData));

    const uploadResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', jsonBuffer, 'spells.json')
      .field('displayName', 'Core Spells')
      .field('tags', 'spells,core,combat')
      .expect(201);

    const documentId = uploadResponse.body.id;

    expect(uploadResponse.body).toMatchObject({
      id: expect.any(String),
      gameSystemId: gameSystemId,
      displayName: 'Core Spells',
      filename: 'spells.json',
      type: 'JSON',
      validationErrors: [], // Should be valid
      tags: expect.arrayContaining(['spells', 'core', 'combat']),
      version: 1,
      isActive: true,
    });

    // Step 2: Upload an invalid JSON document
    const invalidSpellData = {
      spells: [
        {
          name: 'Incomplete Spell',
          // Missing required 'level' and 'school' fields
        },
      ],
    };

    const invalidJsonBuffer = Buffer.from(JSON.stringify(invalidSpellData));

    const invalidUploadResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', invalidJsonBuffer, 'invalid-spells.json')
      .field('displayName', 'Invalid Spells')
      .expect(201); // Should still upload but with validation errors

    expect(invalidUploadResponse.body).toMatchObject({
      validationErrors: expect.arrayContaining([
        expect.stringContaining('level'),
        expect.stringContaining('school'),
      ]),
    });

    // Step 3: Upload a PDF document
    const pdfBuffer = Buffer.from('%PDF-1.4\\nMinimal PDF content\\n%%EOF');

    const pdfUploadResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', pdfBuffer, 'monster-manual.pdf')
      .field('displayName', 'Monster Manual')
      .field('tags', 'monsters,bestiary')
      .expect(201);

    expect(pdfUploadResponse.body).toMatchObject({
      type: 'PDF',
      mimeType: 'application/pdf',
      validationErrors: [], // PDFs don't get JSON validation
    });

    // Step 4: Upload a Markdown document
    const markdownContent = `# Character Classes

## Wizard
A master of arcane magic.

### Features
- Spellcasting
- Arcane Recovery
- Spell Mastery`;

    const mdBuffer = Buffer.from(markdownContent);

    const mdUploadResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', mdBuffer, 'classes.md')
      .field('displayName', 'Character Classes')
      .field('tags', 'classes,character-creation')
      .expect(201);

    expect(mdUploadResponse.body).toMatchObject({
      type: 'MARKDOWN',
      mimeType: 'text/markdown',
    });

    // Step 5: List all documents in the system
    const documentsResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}/documents`)
      .expect(200);

    expect(documentsResponse.body).toHaveLength(4); // 3 uploads + any default documents
    expect(documentsResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ displayName: 'Core Spells' }),
        expect.objectContaining({ displayName: 'Invalid Spells' }),
        expect.objectContaining({ displayName: 'Monster Manual' }),
        expect.objectContaining({ displayName: 'Character Classes' }),
      ])
    );

    // Step 6: Download and verify document content
    const downloadResponse = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/download`)
      .expect(200);

    expect(downloadResponse.headers['content-type']).toMatch(/application\/json/);
    expect(JSON.parse(downloadResponse.text)).toEqual(validSpellData);

    // Step 7: Update document metadata
    const updateResponse = await request(app.getHttpServer())
      .put(`/api/documents/${documentId}`)
      .send({
        displayName: 'Updated Core Spells',
        tags: ['spells', 'core', 'combat', 'updated'],
      })
      .expect(200);

    expect(updateResponse.body).toMatchObject({
      displayName: 'Updated Core Spells',
      tags: expect.arrayContaining(['updated']),
    });

    // Step 8: Filter documents by type and tags
    const jsonDocsResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}/documents`)
      .query({ type: 'JSON' })
      .expect(200);

    jsonDocsResponse.body.forEach((doc: any) => {
      expect(doc.type).toBe('JSON');
    });

    const spellDocsResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}/documents`)
      .query({ tags: ['spells'] })
      .expect(200);

    spellDocsResponse.body.forEach((doc: any) => {
      expect(doc.tags).toEqual(expect.arrayContaining(['spells']));
    });

    // Step 9: Delete a document
    await request(app.getHttpServer())
      .delete(`/api/documents/${documentId}`)
      .expect(204);

    // Step 10: Verify document is no longer accessible
    await request(app.getHttpServer())
      .get(`/api/documents/${documentId}`)
      .expect(404);
  });

  it('should reject unsupported file types', async () => {
    const txtBuffer = Buffer.from('Plain text content');

    await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', txtBuffer, 'unsupported.txt')
      .field('displayName', 'Unsupported File')
      .expect(422);
  });

  it('should handle large file uploads', async () => {
    // Create a large JSON document (but still reasonable for testing)
    const largeSpellData = {
      spells: Array.from({ length: 100 }, (_, i) => ({
        name: `Spell ${i + 1}`,
        level: (i % 9) + 1,
        school: ['Evocation', 'Conjuration', 'Transmutation'][i % 3],
      })),
    };

    const largeJsonBuffer = Buffer.from(JSON.stringify(largeSpellData));

    const response = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', largeJsonBuffer, 'large-spells.json')
      .field('displayName', 'Large Spell Collection')
      .expect(201);

    expect(response.body.fileSize).toBeGreaterThan(1000); // Should be reasonably large
  });
});