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
exports.ErrorResponse = exports.LaunchResponse = exports.WorldResponse = exports.UpdateWorldRequest = exports.CreateWorldRequest = void 0;
const class_validator_1 = require("class-validator");
class CreateWorldRequest {
}
exports.CreateWorldRequest = CreateWorldRequest;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255, { message: 'World name must be between 1 and 255 characters' }),
    __metadata("design:type", String)
], CreateWorldRequest.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(4, { message: 'Game system ID must be a valid UUID' }),
    __metadata("design:type", String)
], CreateWorldRequest.prototype, "gameSystemId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Image URL must be a valid URL' }),
    __metadata("design:type", String)
], CreateWorldRequest.prototype, "imageUrl", void 0);
class UpdateWorldRequest {
}
exports.UpdateWorldRequest = UpdateWorldRequest;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255, { message: 'World name must be between 1 and 255 characters' }),
    __metadata("design:type", String)
], UpdateWorldRequest.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Image URL must be a valid URL' }),
    __metadata("design:type", String)
], UpdateWorldRequest.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateWorldRequest.prototype, "sessionData", void 0);
class WorldResponse {
}
exports.WorldResponse = WorldResponse;
class LaunchResponse {
}
exports.LaunchResponse = LaunchResponse;
class ErrorResponse {
}
exports.ErrorResponse = ErrorResponse;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ErrorResponse.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ErrorResponse.prototype, "statusCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ErrorResponse.prototype, "details", void 0);
//# sourceMappingURL=index.js.map