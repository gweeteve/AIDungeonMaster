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
exports.ErrorResponse = exports.GameSystemSummary = exports.GameSystemResponse = exports.UpdateGameSystemRequest = exports.CreateGameSystemRequest = void 0;
const class_validator_1 = require("class-validator");
class CreateGameSystemRequest {
}
exports.CreateGameSystemRequest = CreateGameSystemRequest;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100, { message: 'Game system name must be between 1 and 100 characters' }),
    __metadata("design:type", String)
], CreateGameSystemRequest.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({}, { message: 'Default image URL must be a valid URL' }),
    __metadata("design:type", String)
], CreateGameSystemRequest.prototype, "defaultImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 1000, { message: 'Description must be 1000 characters or less' }),
    __metadata("design:type", String)
], CreateGameSystemRequest.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateGameSystemRequest.prototype, "rulesetConfig", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateGameSystemRequest.prototype, "isActive", void 0);
class UpdateGameSystemRequest {
}
exports.UpdateGameSystemRequest = UpdateGameSystemRequest;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100, { message: 'Game system name must be between 1 and 100 characters' }),
    __metadata("design:type", String)
], UpdateGameSystemRequest.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Default image URL must be a valid URL' }),
    __metadata("design:type", String)
], UpdateGameSystemRequest.prototype, "defaultImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 1000, { message: 'Description must be 1000 characters or less' }),
    __metadata("design:type", String)
], UpdateGameSystemRequest.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateGameSystemRequest.prototype, "rulesetConfig", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateGameSystemRequest.prototype, "isActive", void 0);
class GameSystemResponse {
}
exports.GameSystemResponse = GameSystemResponse;
class GameSystemSummary {
}
exports.GameSystemSummary = GameSystemSummary;
class ErrorResponse {
}
exports.ErrorResponse = ErrorResponse;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ErrorResponse.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ErrorResponse.prototype, "details", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ErrorResponse.prototype, "statusCode", void 0);
//# sourceMappingURL=index.js.map