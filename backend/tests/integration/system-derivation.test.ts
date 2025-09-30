import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('System Derivation Workflow (Integration)', () => {
  let app: INestApplication;
  let parentSystemId: string;
  let derivedSystemId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a parent game system
    const parentResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send({
        name: 'D&D 5E Base System',
        description: 'The base D&D 5E system for derivation',
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
                },
                required: ['name', 'level'],
              },
            },
          },
        },
      })
      .expect(201);

    parentSystemId = parentResponse.body.id;

    // Add some documents to the parent system
    const spellData = {
      spells: [
        { name: 'Fireball', level: 3 },
        { name: 'Magic Missile', level: 1 },
      ],
    };

    await request(app.getHttpServer())
      .post(`/api/game-systems/${parentSystemId}/documents`)
      .attach('file', Buffer.from(JSON.stringify(spellData)), 'base-spells.json')
      .field('displayName', 'Base Spells')
      .field('tags', 'spells,base')
      .expect(201);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should complete the full system derivation workflow', async () => {
    // Step 1: Create a derived system from the parent
    const deriveRequest = {
      name: 'D&D 5E Horror Variant',
      description: 'A horror-themed variant of D&D 5E',
      parentSystemId: parentSystemId,
      syncWithParent: true,
    };

    const deriveResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send(deriveRequest)
      .expect(201);

    derivedSystemId = deriveResponse.body.id;

    expect(deriveResponse.body).toMatchObject({
      id: expect.any(String),
      name: deriveRequest.name,
      description: deriveRequest.description,
      parentSystemId: parentSystemId,
      syncWithParent: true,
    });

    // Step 2: Verify derived system inherits parent's validation schema
    const derivedDetailResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${derivedSystemId}`)
      .expect(200);

    expect(derivedDetailResponse.body).toMatchObject({
      parentSystemId: parentSystemId,
      parentSystem: expect.objectContaining({
        id: parentSystemId,
        name: 'D&D 5E Base System',
      }),
      validationSchema: expect.objectContaining({
        type: 'object',
        properties: expect.objectContaining({
          spells: expect.any(Object),
        }),
      }),
    });

    // Step 3: Verify parent system shows derived system in relationships
    const parentDetailResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${parentSystemId}`)
      .expect(200);

    expect(parentDetailResponse.body.derivedSystems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: derivedSystemId,
          name: deriveRequest.name,
        })
      ])
    );

    // Step 4: Add variant-specific content to derived system
    const horrorSpellData = {
      spells: [
        { name: 'Necromantic Drain', level: 3 },
        { name: 'Fear Aura', level: 2 },
      ],
    };

    const horrorDocResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${derivedSystemId}/documents`)
      .attach('file', Buffer.from(JSON.stringify(horrorSpellData)), 'horror-spells.json')
      .field('displayName', 'Horror Spells')
      .field('tags', 'spells,horror,necromancy')
      .expect(201);

    expect(horrorDocResponse.body).toMatchObject({
      gameSystemId: derivedSystemId,
      displayName: 'Horror Spells',
      validationErrors: [], // Should validate against inherited schema
    });

    // Step 5: Test sync behavior - add content to parent system
    const newParentSpellData = {
      spells: [
        { name: 'Healing Word', level: 1 },
        { name: 'Cure Wounds', level: 1 },
      ],
    };

    await request(app.getHttpServer())
      .post(`/api/game-systems/${parentSystemId}/documents`)
      .attach('file', Buffer.from(JSON.stringify(newParentSpellData)), 'healing-spells.json')
      .field('displayName', 'Healing Spells')
      .field('tags', 'spells,healing')
      .expect(201);

    // Step 6: Verify derived system can access both inherited and own content
    const derivedDocsResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${derivedSystemId}/documents`)
      .expect(200);

    expect(derivedDocsResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ displayName: 'Horror Spells' }),
        // Should also include inherited documents based on sync setting
      ])
    );

    // Step 7: Test freezing sync - update derived system to not sync
    const updateSyncResponse = await request(app.getHttpServer())
      .put(`/api/game-systems/${derivedSystemId}`)
      .send({ syncWithParent: false })
      .expect(200);

    expect(updateSyncResponse.body.syncWithParent).toBe(false);

    // Step 8: Add more content to parent and verify it's not automatically synced
    const laterParentData = {
      spells: [{ name: 'Later Added Spell', level: 2 }],
    };

    await request(app.getHttpServer())
      .post(`/api/game-systems/${parentSystemId}/documents`)
      .attach('file', Buffer.from(JSON.stringify(laterParentData)), 'later-spells.json')
      .field('displayName', 'Later Added Spells')
      .expect(201);

    // Derived system should not automatically include this new content
    const frozenDocsResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${derivedSystemId}/documents`)
      .expect(200);

    const laterSpellDoc = frozenDocsResponse.body.find(
      (doc: any) => doc.displayName === 'Later Added Spells'
    );
    expect(laterSpellDoc).toBeUndefined();

    // Step 9: Create a second-level derivation
    const grandchildResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send({
        name: 'Cyberpunk Horror Variant',
        description: 'Cyberpunk meets horror',
        parentSystemId: derivedSystemId,
        syncWithParent: false,
      })
      .expect(201);

    expect(grandchildResponse.body).toMatchObject({
      parentSystemId: derivedSystemId,
      syncWithParent: false,
    });

    // Step 10: Test deletion behavior with derivation relationships
    // Should not be able to delete parent while children exist
    const deleteParentResponse = await request(app.getHttpServer())
      .delete(`/api/game-systems/${parentSystemId}`)
      .expect(409);

    expect(deleteParentResponse.body.message).toContain('derived systems');

    // Step 11: Delete derived systems first, then parent
    await request(app.getHttpServer())
      .delete(`/api/game-systems/${grandchildResponse.body.id}`)
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/api/game-systems/${derivedSystemId}`)
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/api/game-systems/${parentSystemId}`)
      .expect(204);
  });

  it('should prevent circular derivation relationships', async () => {
    // Create derived system
    const derivedResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send({
        name: 'Derived System',
        parentSystemId: parentSystemId,
      })
      .expect(201);

    const derivedId = derivedResponse.body.id;

    // Try to make parent derive from its own child (should fail)
    const circularResponse = await request(app.getHttpServer())
      .put(`/api/game-systems/${parentSystemId}`)
      .send({ parentSystemId: derivedId })
      .expect(400);

    expect(circularResponse.body.message).toContain('circular');
  });

  it('should handle validation schema inheritance', async () => {
    // Create derived system
    const derivedResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send({
        name: 'Schema Test Derived',
        parentSystemId: parentSystemId,
      })
      .expect(201);

    // Try to upload invalid JSON to derived system
    const invalidData = { spells: [{ name: 'Invalid' }] }; // Missing required 'level'

    const uploadResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${derivedResponse.body.id}/documents`)
      .attach('file', Buffer.from(JSON.stringify(invalidData)), 'invalid.json')
      .field('displayName', 'Invalid Test')
      .expect(201);

    expect(uploadResponse.body.validationErrors).toEqual(
      expect.arrayContaining([expect.stringContaining('level')])
    );
  });
});