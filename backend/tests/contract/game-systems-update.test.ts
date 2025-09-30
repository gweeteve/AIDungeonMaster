import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('PUT /api/game-systems/:id (Contract)', () => {
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

  it('should update game system metadata', async () => {
    const gameSystemId = 'test-system-id';
    const updateRequest = {
      name: 'Updated Test System',
      description: 'Updated description',
      syncWithParent: false,
    };

    const response = await request(app.getHttpServer())
      .put(`/api/game-systems/${gameSystemId}`)
      .send(updateRequest)
      .expect(200);

    expect(response.body).toMatchObject({
      id: gameSystemId,
      name: updateRequest.name,
      description: updateRequest.description,
      syncWithParent: false,
      updatedAt: expect.any(String),
    });
  });

  it('should update validation schema', async () => {
    const gameSystemId = 'test-system-id';
    const validationSchema = {
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
    };

    const response = await request(app.getHttpServer())
      .put(`/api/game-systems/${gameSystemId}`)
      .send({ validationSchema })
      .expect(200);

    expect(response.body.validationSchema).toEqual(validationSchema);
  });

  it('should reject updates when system is locked', async () => {
    const gameSystemId = 'locked-system-id';

    const response = await request(app.getHttpServer())
      .put(`/api/game-systems/${gameSystemId}`)
      .send({ name: 'Should Fail' })
      .expect(409);

    expect(response.body).toMatchObject({
      error: 'Conflict',
      message: expect.stringContaining('locked'),
      statusCode: 409,
    });
  });

  it('should reject invalid update data', async () => {
    const gameSystemId = 'test-system-id';
    const invalidRequest = {
      name: '', // Invalid: empty name
      description: 'x'.repeat(501), // Invalid: too long
    };

    await request(app.getHttpServer())
      .put(`/api/game-systems/${gameSystemId}`)
      .send(invalidRequest)
      .expect(400);
  });

  it('should return 404 for non-existent game system', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    await request(app.getHttpServer())
      .put(`/api/game-systems/${fakeId}`)
      .send({ name: 'Updated Name' })
      .expect(404);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .put('/api/game-systems/test-id')
      .send({ name: 'Updated Name' })
      .expect(401);
  });
});