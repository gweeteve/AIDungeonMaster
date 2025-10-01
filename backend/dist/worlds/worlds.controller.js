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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const worlds_service_1 = require("./worlds.service");
const dto_1 = require("./dto");
let WorldsController = class WorldsController {
    constructor(worldsService) {
        this.worldsService = worldsService;
    }
    async findAll() {
        return await this.worldsService.findAll();
    }
    async create(createWorldRequest) {
        return await this.worldsService.create(createWorldRequest);
    }
    async findOne(id) {
        const world = await this.worldsService.findById(id);
        return {
            id: world.id,
            name: world.name,
            imageUrl: world.imageUrl,
            gameSystem: {
                id: world.gameSystemId,
                name: 'Unknown',
                defaultImageUrl: 'https://example.com/default.jpg'
            },
            lastAccessedAt: world.lastAccessedAt.toISOString(),
            createdAt: world.createdAt.toISOString()
        };
    }
    async update(id, updateWorldRequest) {
        return await this.worldsService.update(id, updateWorldRequest);
    }
    async remove(id) {
        await this.worldsService.delete(id);
    }
};
exports.WorldsController = WorldsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all worlds for homepage display' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of worlds with embedded game system info',
        type: [dto_1.WorldResponse]
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
        type: dto_1.ErrorResponse
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorldsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new world' }),
    (0, swagger_1.ApiBody)({
        type: dto_1.CreateWorldRequest,
        description: 'World creation data'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'World created successfully',
        type: dto_1.WorldResponse
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Validation error',
        type: dto_1.ErrorResponse
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
        type: dto_1.ErrorResponse
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateWorldRequest]),
    __metadata("design:returntype", Promise)
], WorldsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific world by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'World ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'World found',
        type: dto_1.WorldResponse
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'World not found',
        type: dto_1.ErrorResponse
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorldsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a world' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'World ID' }),
    (0, swagger_1.ApiBody)({
        type: dto_1.UpdateWorldRequest,
        description: 'World update data'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'World updated successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'World not found',
        type: dto_1.ErrorResponse
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Validation error',
        type: dto_1.ErrorResponse
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateWorldRequest]),
    __metadata("design:returntype", Promise)
], WorldsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a world' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'World ID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'World deleted successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'World not found',
        type: dto_1.ErrorResponse
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorldsController.prototype, "remove", null);
exports.WorldsController = WorldsController = __decorate([
    (0, swagger_1.ApiTags)('worlds'),
    (0, common_1.Controller)('api/worlds'),
    __metadata("design:paramtypes", [worlds_service_1.WorldsService])
], WorldsController);
//# sourceMappingURL=worlds.controller.js.map