import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('JSON Validation Workflow (Integration)', () => {
  let app: INestApplication;
  let gameSystemId: string;

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

  it('should complete the full JSON validation workflow', async () => {
    // Step 1: Create system with comprehensive validation schema
    const validationSchema = {
      type: 'object',
      properties: {
        metadata: {
          type: 'object',
          properties: {
            version: { type: 'string' },
            author: { type: 'string' },
          },
          required: ['version'],
        },
        spells: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 1 },
              level: { type: 'number', minimum: 0, maximum: 9 },
              school: {
                type: 'string',
                enum: ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'],
              },
              components: {
                type: 'object',
                properties: {
                  verbal: { type: 'boolean' },
                  somatic: { type: 'boolean' },
                  material: { type: 'boolean' },
                  materialComponent: { type: 'string' },
                },
                required: ['verbal', 'somatic', 'material'],
              },
              duration: { type: 'string' },
              range: { type: 'string' },
              castingTime: { type: 'string' },
            },
            required: ['name', 'level', 'school', 'components'],
          },
        },
        monsters: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 1 },
              type: { type: 'string' },
              size: {
                type: 'string',
                enum: ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'],
              },
              hitPoints: { type: 'number', minimum: 1 },
              armorClass: { type: 'number', minimum: 1 },
              abilities: {
                type: 'object',
                properties: {
                  strength: { type: 'number', minimum: 1, maximum: 30 },
                  dexterity: { type: 'number', minimum: 1, maximum: 30 },
                  constitution: { type: 'number', minimum: 1, maximum: 30 },
                  intelligence: { type: 'number', minimum: 1, maximum: 30 },
                  wisdom: { type: 'number', minimum: 1, maximum: 30 },
                  charisma: { type: 'number', minimum: 1, maximum: 30 },
                },
                required: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'],
              },
            },
            required: ['name', 'type', 'size', 'hitPoints', 'armorClass', 'abilities'],
          },
        },
      },
      required: ['metadata'],
    };

    const systemResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send({
        name: 'Validation Test System',
        description: 'System for testing comprehensive JSON validation',
        validationSchema: validationSchema,
      })
      .expect(201);

    gameSystemId = systemResponse.body.id;

    // Step 2: Upload completely valid JSON
    const validData = {
      metadata: {
        version: '1.0.0',
        author: 'Test Author',
      },
      spells: [
        {
          name: 'Fireball',
          level: 3,
          school: 'Evocation',
          components: {
            verbal: true,
            somatic: true,
            material: true,
            materialComponent: 'A tiny ball of bat guano and sulfur',
          },
          duration: 'Instantaneous',
          range: '150 feet',
          castingTime: '1 action',
        },
        {
          name: 'Magic Missile',
          level: 1,
          school: 'Evocation',
          components: {
            verbal: true,
            somatic: true,
            material: false,
          },
          duration: 'Instantaneous',
          range: '120 feet',
          castingTime: '1 action',
        },
      ],
      monsters: [
        {
          name: 'Goblin',
          type: 'humanoid',
          size: 'Small',
          hitPoints: 7,
          armorClass: 15,
          abilities: {
            strength: 8,
            dexterity: 14,
            constitution: 10,
            intelligence: 10,
            wisdom: 8,
            charisma: 8,
          },
        },
      ],
    };

    const validUploadResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', Buffer.from(JSON.stringify(validData)), 'valid-content.json')
      .field('displayName', 'Valid Game Content')
      .expect(201);

    expect(validUploadResponse.body).toMatchObject({
      validationErrors: [],
      type: 'JSON',
    });

    // Step 3: Upload JSON with missing required fields
    const missingFieldsData = {
      metadata: {
        // Missing required 'version' field
        author: 'Test Author',
      },
      spells: [
        {
          name: 'Incomplete Spell',
          level: 2,
          // Missing required 'school' and 'components' fields
        },
      ],
    };

    const missingFieldsResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', Buffer.from(JSON.stringify(missingFieldsData)), 'missing-fields.json')
      .field('displayName', 'Missing Fields Test')
      .expect(201);

    expect(missingFieldsResponse.body.validationErrors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('version'),
        expect.stringContaining('school'),
        expect.stringContaining('components'),
      ])
    );

    // Step 4: Upload JSON with invalid data types
    const invalidTypesData = {
      metadata: {
        version: 123, // Should be string
        author: 'Test Author',
      },
      spells: [
        {
          name: '', // Invalid: empty string when minLength is 1
          level: 'three', // Should be number
          school: 'InvalidSchool', // Not in enum
          components: {
            verbal: 'yes', // Should be boolean
            somatic: true,
            material: false,
          },
        },
      ],
      monsters: [
        {
          name: 'Test Monster',
          type: 'humanoid',
          size: 'InvalidSize', // Not in enum
          hitPoints: -5, // Should be minimum 1
          armorClass: 10,
          abilities: {
            strength: 50, // Should be maximum 30
            dexterity: 0, // Should be minimum 1
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
          },
        },
      ],
    };

    const invalidTypesResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', Buffer.from(JSON.stringify(invalidTypesData)), 'invalid-types.json')
      .field('displayName', 'Invalid Types Test')
      .expect(201);

    expect(invalidTypesResponse.body.validationErrors.length).toBeGreaterThan(5);
    expect(invalidTypesResponse.body.validationErrors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('version'),
        expect.stringContaining('level'),
        expect.stringContaining('school'),
        expect.stringContaining('size'),
        expect.stringContaining('strength'),
        expect.stringContaining('dexterity'),
      ])
    );

    // Step 5: Upload JSON with additional properties (should be allowed)
    const extraPropertiesData = {
      metadata: {
        version: '1.0.0',
        author: 'Test Author',
        extraField: 'This should be allowed', // Additional property
      },
      spells: [
        {
          name: 'Enhanced Fireball',
          level: 3,
          school: 'Evocation',
          components: {
            verbal: true,
            somatic: true,
            material: true,
          },
          customProperty: 'Custom data', // Additional property
        },
      ],
    };

    const extraPropsResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', Buffer.from(JSON.stringify(extraPropertiesData)), 'extra-props.json')
      .field('displayName', 'Extra Properties Test')
      .expect(201);

    // Should be valid (JSON Schema allows additional properties by default)
    expect(extraPropsResponse.body.validationErrors).toEqual([]);

    // Step 6: Update validation schema and test re-validation
    const updatedSchema = {
      ...validationSchema,
      properties: {
        ...validationSchema.properties,
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              category: { type: 'string' },
              weight: { type: 'number', minimum: 0 },
            },
            required: ['name', 'category'],
          },
        },
      },
      required: [...validationSchema.required, 'items'],
    };

    await request(app.getHttpServer())
      .put(`/api/game-systems/${gameSystemId}`)
      .send({ validationSchema: updatedSchema })
      .expect(200);

    // Step 7: Upload JSON that would be invalid against new schema
    const newSchemaTestData = {
      metadata: { version: '1.0.0' },
      // Missing now-required 'items' array
    };

    const newSchemaResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${gameSystemId}/documents`)
      .attach('file', Buffer.from(JSON.stringify(newSchemaTestData)), 'new-schema-test.json')
      .field('displayName', 'New Schema Test')
      .expect(201);

    expect(newSchemaResponse.body.validationErrors).toEqual(
      expect.arrayContaining([expect.stringContaining('items')])
    );

    // Step 8: List documents and verify validation status
    const documentsResponse = await request(app.getHttpServer())
      .get(`/api/game-systems/${gameSystemId}/documents`)
      .expect(200);

    const validDoc = documentsResponse.body.find(
      (doc: any) => doc.displayName === 'Valid Game Content'
    );
    const invalidDoc = documentsResponse.body.find(
      (doc: any) => doc.displayName === 'Invalid Types Test'
    );

    expect(validDoc.validationErrors).toEqual([]);
    expect(invalidDoc.validationErrors.length).toBeGreaterThan(0);

    // Step 9: Test validation with no schema (should always pass)
    const noSchemaSystemResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send({
        name: 'No Schema System',
        description: 'System without validation schema',
      })
      .expect(201);

    const anyJsonResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${noSchemaSystemResponse.body.id}/documents`)
      .attach('file', Buffer.from('{"anything": "goes", "number": 42}'), 'anything.json')
      .field('displayName', 'Anything Goes')
      .expect(201);

    expect(anyJsonResponse.body.validationErrors).toEqual([]);
  });

  it('should handle malformed JSON gracefully', async () => {
    // Create simple system
    const systemResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send({ name: 'Malformed JSON Test' })
      .expect(201);

    // Try to upload malformed JSON
    const malformedJson = '{"incomplete": json content without closing';

    const response = await request(app.getHttpServer())
      .post(`/api/game-systems/${systemResponse.body.id}/documents`)
      .attach('file', Buffer.from(malformedJson), 'malformed.json')
      .field('displayName', 'Malformed JSON')
      .expect(422);

    expect(response.body).toMatchObject({
      statusCode: 422,
      error: 'Unprocessable Entity',
      validationErrors: expect.arrayContaining([
        expect.objectContaining({
          field: 'file',
          message: expect.stringContaining('Invalid JSON'),
        }),
      ]),
    });
  });

  it('should validate complex nested schemas', async () => {
    const nestedSchema = {
      type: 'object',
      properties: {
        campaign: {
          type: 'object',
          properties: {
            settings: {
              type: 'object',
              properties: {
                themes: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 1,
                },
                difficulty: {
                  type: 'object',
                  properties: {
                    combat: { type: 'number', minimum: 1, maximum: 10 },
                    roleplay: { type: 'number', minimum: 1, maximum: 10 },
                    exploration: { type: 'number', minimum: 1, maximum: 10 },
                  },
                  required: ['combat', 'roleplay', 'exploration'],
                },
              },
              required: ['themes', 'difficulty'],
            },
          },
          required: ['settings'],
        },
      },
      required: ['campaign'],
    };

    const systemResponse = await request(app.getHttpServer())
      .post('/api/game-systems')
      .send({
        name: 'Nested Schema Test',
        validationSchema: nestedSchema,
      })
      .expect(201);

    const validNestedData = {
      campaign: {
        settings: {
          themes: ['horror', 'mystery'],
          difficulty: {
            combat: 7,
            roleplay: 8,
            exploration: 6,
          },
        },
      },
    };

    const validResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${systemResponse.body.id}/documents`)
      .attach('file', Buffer.from(JSON.stringify(validNestedData)), 'valid-nested.json')
      .field('displayName', 'Valid Nested')
      .expect(201);

    expect(validResponse.body.validationErrors).toEqual([]);

    const invalidNestedData = {
      campaign: {
        settings: {
          themes: [], // Invalid: minItems is 1
          difficulty: {
            combat: 15, // Invalid: maximum is 10
            roleplay: 0, // Invalid: minimum is 1
            // Missing required 'exploration'
          },
        },
      },
    };

    const invalidResponse = await request(app.getHttpServer())
      .post(`/api/game-systems/${systemResponse.body.id}/documents`)
      .attach('file', Buffer.from(JSON.stringify(invalidNestedData)), 'invalid-nested.json')
      .field('displayName', 'Invalid Nested')
      .expect(201);

    expect(invalidResponse.body.validationErrors.length).toBeGreaterThan(2);
  });
});