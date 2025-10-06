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
const game_system_service_1 = require("../services/game-system.service");
let GameSystemsController = class GameSystemsController {
    constructor(gameSystemService) {
        this.gameSystemService = gameSystemService;
    }
    async findAll(query) {
        return await this.gameSystemService.findAll(query);
    }
    async create(createRequest, req) {
        const userId = req.user?.id || 'mock-user-id';
        return await this.gameSystemService.create(createRequest, userId);
    }
    async findOne(id) {
        const gameSystem = await this.gameSystemService.findById(id);
        if (!gameSystem) {
            throw new Error('Game system not found');
        }
        return gameSystem;
    }
    async update(id, updateRequest, req) {
        const userId = req.user?.id || 'mock-user-id';
        return await this.gameSystemService.update(id, updateRequest, userId);
    }
    async remove(id, req) {
        const userId = req.user?.id || 'mock-user-id';
        await this.gameSystemService.delete(id, userId);
    }
    async acquireLock(id, req) {
        const userId = req.user?.id || 'mock-user-id';
        return await this.gameSystemService.acquireLock(id, userId);
    }
    async releaseLock(id, req) {
        const userId = req.user?.id || 'mock-user-id';
        await this.gameSystemService.releaseLock(id, userId);
    }
};
exports.GameSystemsController = GameSystemsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all game systems' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of game systems' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'ownerId', required: false, type: String }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new game system' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Game system created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Game system name already exists' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific game system' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Game system details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game system not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a game system' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Game system updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game system not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'System is locked or name conflict' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a game system' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Game system deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game system not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cannot delete system in use' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/lock'),
    (0, swagger_1.ApiOperation)({ summary: 'Acquire edit lock' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lock acquired successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game system not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'System already locked' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "acquireLock", null);
__decorate([
    (0, common_1.Delete)(':id/lock'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Release edit lock' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Lock released successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game system not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not authorized to release lock' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GameSystemsController.prototype, "releaseLock", null);
exports.GameSystemsController = GameSystemsController = __decorate([
    (0, swagger_1.ApiTags)('Game Systems'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/game-systems'),
    __metadata("design:paramtypes", [game_system_service_1.GameSystemService])
], GameSystemsController);
//# sourceMappingURL=game-systems.controller.js.map