import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('POST /api/game-systems (Contract)', () => {
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

  it('should create a new game system with valid data', async () => {
    const createRequest = {
      name: 'Test D&D System',
      description: 'A test game system for D&D',
      syncWithParent: true,
    };

    const response = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send(createRequest)
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: createRequest.name,
      description: createRequest.description,
      ownerId: expect.any(String),
      isPublic: expect.any(Boolean),
      syncWithParent: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('should create a derived game system', async () => {
    const deriveRequest = {
      name: 'Derived Test System',
      parentSystemId: 'parent-system-id',
      syncWithParent: false,
    };

    const response = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send(deriveRequest)
      .expect(201);

    expect(response.body).toMatchObject({
      name: deriveRequest.name,
      parentSystemId: 'parent-system-id',
      syncWithParent: false,
    });
  });

  it('should reject invalid game system data', async () => {
    const invalidRequest = {
      name: '', // Invalid: empty name
      description: 'x'.repeat(501), // Invalid: too long
    };

    await request(app.getHttpServer())
      .post('/api/game-systems')
      .send(invalidRequest)
      .expect(400);
  });

  it('should reject duplicate game system names for same user', async () => {
    const duplicateRequest = {
      name: 'Duplicate System Name',
    };

    // First creation should succeed
    await request(app.getHttpServer())
      .post('/api/game-systems')
      .send(duplicateRequest)
      .expect(201);

    // Second creation should fail
    await request(app.getHttpServer())
      .post('/api/game-systems')
      .send(duplicateRequest)
      .expect(409);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/game-systems')
      .send({ name: 'Test System' })
      .expect(401);
  });
});