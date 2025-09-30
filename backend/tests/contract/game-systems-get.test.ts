import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('GET /api/game-systems/:id (Contract)', () => {
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

  it('should return game system details with relationships', async () => {
    const gameSystemId = 'test-system-id';

    const response = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: gameSystemId,
      name: expect.any(String),
      ownerId: expect.any(String),
      isPublic: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      documents: expect.any(Array),
      derivedSystems: expect.any(Array),
    });

    // Check if parentSystem is included when it exists
    if (response.body.parentSystemId) {
      expect(response.body.parentSystem).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    }

    // Check if validationSchema is included when it exists
    if (response.body.validationSchema) {
      expect(response.body.validationSchema).toEqual(expect.any(Object));
    }
  });

  it('should return 404 for non-existent game system', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    const response = await request(app.getHttpServer())
      .get(`/api/game-systems/${fakeId}`)
      .expect(404);

    expect(response.body).toMatchObject({
      error: 'Not Found',
      message: expect.any(String),
      statusCode: 404,
    });
  });

  it('should validate UUID format', async () => {
    await request(app.getHttpServer())
      .get('/api/game-systems/invalid-uuid')
      .expect(400);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/game-systems/test-id')
      .expect(401);
  });
});