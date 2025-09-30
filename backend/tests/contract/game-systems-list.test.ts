import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('GET /api/game-systems (Contract)', () => {
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

  it('should return paginated list of game systems', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/game-systems')
      .query({ page: 1, limit: 20 })
      .expect(200);

    expect(response.body).toMatchObject({
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          ownerId: expect.any(String),
          isPublic: expect.any(Boolean),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          syncWithParent: expect.any(Boolean),
        })
      ]),
      pagination: {
        page: 1,
        limit: 20,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      },
    });
  });

  it('should support search filtering', async () => {
    await request(app.getHttpServer())
      .get('/api/game-systems')
      .query({ search: 'D&D' })
      .expect(200);
  });

  it('should support owner filtering', async () => {
    await request(app.getHttpServer())
      .get('/api/game-systems')
      .query({ ownerId: 'test-user-id' })
      .expect(200);
  });

  it('should validate pagination parameters', async () => {
    await request(app.getHttpServer())
      .get('/api/game-systems')
      .query({ page: 0, limit: 101 })
      .expect(400);
  });
});