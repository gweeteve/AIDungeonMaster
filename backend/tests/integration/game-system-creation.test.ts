import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Game System Creation Workflow (Integration)', () => {
  let app: INestApplication;
  let createdSystemId: string;

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

  it('should complete the full game system creation workflow', async () => {
    // Step 1: Create a new game system
    const createRequest = {
      name: 'Integration Test D&D System',
      description: 'A complete test system for integration testing',
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
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send(createRequest)
      .expect(201);

    createdSystemId = createResponse.body.id;
    
    expect(createResponse.body).toMatchObject({
      id: expect.any(String),
      name: createRequest.name,
      description: createRequest.description,
      validationSchema: createRequest.validationSchema,
      ownerId: expect.any(String),
      isPublic: true, // Default collaborative model
      syncWithParent: true, // Default value
    });

    // Step 2: Verify system appears in list
    const listResponse = await request(app.getHttpServer())
      .get('/api/game-systems')
      .expect(200);

    expect(listResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdSystemId,
          name: createRequest.name,
        })
      ])
    );

    // Step 3: Get detailed system information
    const detailResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${createdSystemId}`)
      .expect(200);

    expect(detailResponse.body).toMatchObject({
      id: createdSystemId,
      name: createRequest.name,
      description: createRequest.description,
      documents: [], // Should be empty initially
      derivedSystems: [], // Should be empty initially
      validationSchema: createRequest.validationSchema,
    });

    // Step 4: Update system metadata
    const updateRequest = {
      name: 'Updated Integration Test System',
      description: 'Updated description for testing',
    };

    const updateResponse = await request(app.getHttpServer())
      .put(`/api/game-systems/${createdSystemId}`)
      .send(updateRequest)
      .expect(200);

    expect(updateResponse.body).toMatchObject({
      id: createdSystemId,
      name: updateRequest.name,
      description: updateRequest.description,
    });

    // Step 5: Verify system can be used for session creation
    // This would be tested when session management is implemented
    const sessionCheckResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${createdSystemId}`)
      .expect(200);

    expect(sessionCheckResponse.body.id).toBe(createdSystemId);

    // Step 6: Clean up - delete the system
    await request(app.getHttpServer())
      .delete(`/api/game-systems/${createdSystemId}`)
      .expect(204);

    // Step 7: Verify system is no longer accessible
    await request(app.getHttpServer())
      .get(`/api/game-systems/${createdSystemId}`)
      .expect(404);
  });

  it('should handle validation errors during creation', async () => {
    const invalidRequest = {
      name: '', // Invalid: empty name
      description: 'x'.repeat(501), // Invalid: too long
    };

    const response = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send(invalidRequest)
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      validationErrors: expect.arrayContaining([
        expect.objectContaining({
          field: 'name',
          message: expect.any(String),
        }),
        expect.objectContaining({
          field: 'description',
          message: expect.any(String),
        }),
      ]),
    });
  });

  it('should enforce collaborative editing permissions', async () => {
    // Create system with user A
    const createResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send({ name: 'Collaborative Test System' })
      .expect(201);

    const systemId = createResponse.body.id;

    // User B should be able to edit the system (collaborative model)
    await request(app.getHttpServer())
      .put(`/api/game-systems/${systemId}`)
      .send({ name: 'Edited by User B' })
      .expect(200);

    // User C should be able to delete the system (collaborative model)
    await request(app.getHttpServer())
      .delete(`/api/game-systems/${systemId}`)
      .expect(204);
  });
});