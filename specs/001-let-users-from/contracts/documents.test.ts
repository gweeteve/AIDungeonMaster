import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app';
import * as fs from 'fs';
import * as path from 'path';

describe('Documents API Contract Tests', () => {
  let authToken: string;
  let gameSystemId: string;
  let documentId: string;

  beforeAll(async () => {
    authToken = await getTestAuthToken();
    gameSystemId = await createTestGameSystem();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/game-systems/:id/documents', () => {
    it('should upload a JSON document successfully', async () => {
      const testJson = { spell: { name: 'Fireball', level: 3 } };
      const jsonBuffer = Buffer.from(JSON.stringify(testJson));

      const response = await request(app)
        .post(`/api/game-systems/${gameSystemId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', jsonBuffer, 'fireball.json')
        .field('displayName', 'Fireball Spell')
        .field('tags', ['spells', 'combat'])
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
        tags: ['spells', 'combat'],
        version: 1,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });

      documentId = response.body.id;
    });

    it('should upload a PDF document successfully', async () => {
      // Create a minimal PDF buffer for testing
      const pdfBuffer = createTestPdf();

      const response = await request(app)
        .post(`/api/game-systems/${gameSystemId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', pdfBuffer, 'monsters.pdf')
        .field('displayName', 'Monster Manual')
        .field('tags', ['monsters', 'bestiary'])
        .expect(201);

      expect(response.body).toMatchObject({
        displayName: 'Monster Manual',
        filename: 'monsters.pdf',
        type: 'PDF',
        mimeType: 'application/pdf',
        tags: ['monsters', 'bestiary']
      });
    });

    it('should upload a Markdown document successfully', async () => {
      const markdownContent = `# Character Classes\n\n## Fighter\nA warrior class...`;
      const mdBuffer = Buffer.from(markdownContent);

      const response = await request(app)
        .post(`/api/game-systems/${gameSystemId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', mdBuffer, 'classes.md')
        .field('displayName', 'Character Classes')
        .field('tags', ['classes', 'character-creation'])
        .expect(201);

      expect(response.body).toMatchObject({
        displayName: 'Character Classes',
        filename: 'classes.md',
        type: 'MARKDOWN',
        mimeType: 'text/markdown'
      });
    });

    it('should reject invalid JSON documents', async () => {
      const invalidJson = Buffer.from('{ invalid json content');

      await request(app)
        .post(`/api/game-systems/${gameSystemId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', invalidJson, 'invalid.json')
        .field('displayName', 'Invalid JSON')
        .expect(422);
    });

    it('should reject unsupported file types', async () => {
      const txtBuffer = Buffer.from('Plain text content');

      await request(app)
        .post(`/api/game-systems/${gameSystemId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', txtBuffer, 'unsupported.txt')
        .field('displayName', 'Text File')
        .expect(422);
    });

    it('should reject duplicate document names', async () => {
      const jsonBuffer = Buffer.from('{"duplicate": true}');

      await request(app)
        .post(`/api/game-systems/${gameSystemId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', jsonBuffer, 'duplicate.json')
        .field('displayName', 'Fireball Spell') // Same as first test
        .expect(409);
    });

    it('should reject uploads when system is locked', async () => {
      // Acquire lock with different user
      const otherToken = await getOtherUserToken();
      await request(app)
        .post(`/api/game-systems/${gameSystemId}/lock`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      // Try to upload
      const jsonBuffer = Buffer.from('{"test": true}');
      await request(app)
        .post(`/api/game-systems/${gameSystemId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', jsonBuffer, 'test.json')
        .field('displayName', 'Should Fail')
        .expect(409);

      // Release lock
      await request(app)
        .delete(`/api/game-systems/${gameSystemId}/lock`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(204);
    });
  });

  describe('GET /api/game-systems/:id/documents', () => {
    it('should list all documents in a game system', async () => {
      const response = await request(app)
        .get(`/api/game-systems/${gameSystemId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            gameSystemId: gameSystemId,
            displayName: expect.any(String),
            type: expect.stringMatching(/^(JSON|PDF|MARKDOWN)$/)
          })
        ])
      );
    });

    it('should filter documents by type', async () => {
      const response = await request(app)
        .get(`/api/game-systems/${gameSystemId}/documents?type=JSON`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.forEach((doc: any) => {
        expect(doc.type).toBe('JSON');
      });
    });

    it('should filter documents by tags', async () => {
      const response = await request(app)
        .get(`/api/game-systems/${gameSystemId}/documents?tags=spells`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.forEach((doc: any) => {
        expect(doc.tags).toContain('spells');
      });
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should return document metadata with relationships', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: documentId,
        gameSystemId: gameSystemId,
        gameSystem: expect.objectContaining({
          id: gameSystemId,
          name: expect.any(String)
        }),
        uploader: expect.objectContaining({
          id: expect.any(String),
          username: expect.any(String)
        }),
        previousVersions: expect.any(Array)
      });
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      
      await request(app)
        .get(`/api/documents/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/documents/:id/download', () => {
    it('should download JSON document content', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toMatchObject({
        spell: {
          name: 'Fireball',
          level: 3
        }
      });
    });

    it('should download with proper content disposition header', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-disposition']).toMatch(/attachment; filename=/);
    });
  });

  describe('PUT /api/documents/:id', () => {
    it('should update document metadata', async () => {
      const updateRequest = {
        displayName: 'Updated Fireball Spell',
        tags: ['spells', 'evocation', 'damage']
      };

      const response = await request(app)
        .put(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body).toMatchObject({
        id: documentId,
        displayName: updateRequest.displayName,
        tags: updateRequest.tags
      });
    });

    it('should reject updates when system is locked', async () => {
      // Acquire lock with different user
      const otherToken = await getOtherUserToken();
      await request(app)
        .post(`/api/game-systems/${gameSystemId}/lock`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      // Try to update
      await request(app)
        .put(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ displayName: 'Should Fail' })
        .expect(409);

      // Release lock
      await request(app)
        .delete(`/api/game-systems/${gameSystemId}/lock`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(204);
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete document successfully', async () => {
      await request(app)
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify document is no longer accessible
      await request(app)
        .get(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

// Helper functions
function createTestPdf(): Buffer {
  // Create a minimal valid PDF for testing
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj
xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000120 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
200
%%EOF`;
  return Buffer.from(pdfContent);
}

async function getTestAuthToken(): Promise<string> {
  throw new Error('Test helper not implemented');
}

async function getOtherUserToken(): Promise<string> {
  throw new Error('Test helper not implemented');
}

async function createTestGameSystem(): Promise<string> {
  throw new Error('Test helper not implemented');
}

async function cleanupTestData(): Promise<void> {
  throw new Error('Test helper not implemented');
}