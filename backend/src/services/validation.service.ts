import { Injectable } from '@nestjs/common';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

@Injectable()
export class ValidationService {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false, // Allow additional properties by default
    });
    
    // Add format validators (email, uri, date, etc.)
    addFormats(this.ajv);
  }

  async validateJson(data: any, schema: object): Promise<string[]> {
    try {
      const validate = this.ajv.compile(schema);
      const valid = validate(data);

      if (!valid && validate.errors) {
        return this.formatValidationErrors(validate.errors);
      }

      return [];
    } catch (error) {
      if (error instanceof Error) {
        return [`Schema validation error: ${error.message}`];
      }

      return ['Schema validation error: Unknown error'];
    }
  }

  private formatValidationErrors(errors: ErrorObject[]): string[] {
    return errors.map(error => {
      const path = error.instancePath || 'root';
      const message = error.message || 'validation failed';
      
      switch (error.keyword) {
        case 'required':
          return `Missing required property '${error.params?.missingProperty}' at ${path}`;
        case 'type':
          return `Property at ${path} should be ${error.params?.type}, but got ${typeof error.data}`;
        case 'enum':
          return `Property at ${path} should be one of: ${error.params?.allowedValues?.join(', ')}`;
        case 'minimum':
          return `Property at ${path} should be >= ${error.params?.limit}`;
        case 'maximum':
          return `Property at ${path} should be <= ${error.params?.limit}`;
        case 'minLength':
          return `Property at ${path} should have at least ${error.params?.limit} characters`;
        case 'maxLength':
          return `Property at ${path} should have at most ${error.params?.limit} characters`;
        case 'minItems':
          return `Array at ${path} should have at least ${error.params?.limit} items`;
        case 'maxItems':
          return `Array at ${path} should have at most ${error.params?.limit} items`;
        case 'format':
          return `Property at ${path} should match format '${error.params?.format}'`;
        case 'pattern':
          return `Property at ${path} should match pattern '${error.params?.pattern}'`;
        default:
          return `Validation error at ${path}: ${message}`;
      }
    });
  }

  isValidJsonSchema(schema: any): boolean {
    try {
      this.ajv.compile(schema);
      return true;
    } catch {
      return false;
    }
  }

  async validateGameSystemSchema(schema: object): Promise<string[]> {
    // Basic validation for game system schemas
    const metaSchema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['object'] },
        properties: { type: 'object' },
        required: { 
          type: 'array', 
          items: { type: 'string' } 
        },
        additionalProperties: { type: 'boolean' },
      },
      required: ['type'],
      additionalProperties: true,
    };

    return await this.validateJson(schema, metaSchema);
  }

  // Common schemas for RPG content validation
  getCommonRpgSchemas(): Record<string, object> {
    return {
      spell: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          level: { type: 'number', minimum: 0, maximum: 9 },
          school: { 
            type: 'string',
            enum: ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation']
          },
          castingTime: { type: 'string' },
          range: { type: 'string' },
          duration: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['name', 'level', 'school'],
      },
      
      monster: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          type: { type: 'string' },
          size: { 
            type: 'string',
            enum: ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']
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

      item: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          type: { type: 'string' },
          rarity: { 
            type: 'string',
            enum: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact']
          },
          weight: { type: 'number', minimum: 0 },
          value: { type: 'number', minimum: 0 },
          description: { type: 'string' },
        },
        required: ['name', 'type'],
      },
    };
  }
}