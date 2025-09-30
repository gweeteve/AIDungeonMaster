"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const common_1 = require("@nestjs/common");
const ajv_1 = require("ajv");
const ajv_formats_1 = require("ajv-formats");
let ValidationService = class ValidationService {
    constructor() {
        this.ajv = new ajv_1.default({
            allErrors: true,
            verbose: true,
            strict: false,
        });
        (0, ajv_formats_1.default)(this.ajv);
    }
    async validateJson(data, schema) {
        try {
            const validate = this.ajv.compile(schema);
            const valid = validate(data);
            if (!valid && validate.errors) {
                return this.formatValidationErrors(validate.errors);
            }
            return [];
        }
        catch (error) {
            return [`Schema validation error: ${error.message}`];
        }
    }
    formatValidationErrors(errors) {
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
    isValidJsonSchema(schema) {
        try {
            this.ajv.compile(schema);
            return true;
        }
        catch {
            return false;
        }
    }
    async validateGameSystemSchema(schema) {
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
    getCommonRpgSchemas() {
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
};
exports.ValidationService = ValidationService;
exports.ValidationService = ValidationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ValidationService);
//# sourceMappingURL=validation.service.js.map