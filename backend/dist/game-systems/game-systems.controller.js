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
exports.GameSystemsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const game_systems_service_1 = require("./game-systems.service");
const dto_1 = require("./dto");
let GameSystemsController = class GameSystemsController {
    constructor(gameSystemsService) {
        this.gameSystemsService = gameSystemsService;
    }
    async findAllActive() {
        return await this.gameSystemsService.findAllActive();
    }
    async findAll() {
        const systems = await this.gameSystemsService.findAll();
        return systems.map(system => system.toResponse());
    }
    async getUsageStats() {
        return await this.gameSystemsService.getUsageStats();
    }
    async findOne(id) {
        const gameSystem = await this.gameSystemsService.findById(id);
        return gameSystem.toResponse();
    }
    async create(createGameSystemRequest) {
        const gameSystem = await this.gameSystemsService.create(createGameSystemRequest);
        return gameSystem.toResponse();
    }
    async update(id, updateGameSystemRequest) {
        const gameSystem = await this.gameSystemsService.update(id, updateGameSystemRequest);
        return gameSystem.toResponse();
    }
    async activate(id) {
        const gameSystem = await this.gameSystemsService.activate(id);
        return gameSystem.toResponse();
    }
    async deactivate(id) {
        const gameSystem = await this.gameSystemsService.deactivate(id);
        return gameSystem.toResponse();
    }
    async remove(id) {
        await this.gameSystemsService.delete(id);
    }
};
exports.GameSystemsController = GameSystemsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active game systems' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of active game systems',
        type: [dto_1.GameSystemResponse]
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
        type: dto_1.ErrorResponse
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "findAllActive", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all game systems (including inactive)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all game systems'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('usage-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get usage statistics for all game systems' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usage statistics by game system ID'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "getUsageStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific game system by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Game system ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game system found'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Game system not found',
        type: dto_1.ErrorResponse
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new game system' }),
    (0, swagger_1.ApiBody)({
        type: dto_1.CreateGameSystemRequest,
        description: 'Game system creation data'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Game system created successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Validation error',
        type: dto_1.ErrorResponse
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateGameSystemRequest]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a game system' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Game system ID' }),
    (0, swagger_1.ApiBody)({
        type: dto_1.UpdateGameSystemRequest,
        description: 'Game system update data'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game system updated successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Game system not found',
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
    __metadata("design:paramtypes", [String, dto_1.UpdateGameSystemRequest]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a game system' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Game system ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game system activated successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Game system not found',
        type: dto_1.ErrorResponse
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a game system' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Game system ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game system deactivated successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Game system not found',
        type: dto_1.ErrorResponse
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot deactivate - system in use',
        type: dto_1.ErrorResponse
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a game system' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Game system ID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Game system deleted successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Game system not found',
        type: dto_1.ErrorResponse
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot delete - system in use',
        type: dto_1.ErrorResponse
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "remove", null);
exports.GameSystemsController = GameSystemsController = __decorate([
    (0, swagger_1.ApiTags)('game-systems'),
    (0, common_1.Controller)('api/game-systems'),
    __metadata("design:paramtypes", [game_systems_service_1.GameSystemsService])
], GameSystemsController);
//# sourceMappingURL=game-systems.controller.js.map