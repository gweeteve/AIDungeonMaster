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
exports.World = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class World {
    constructor(data = {}) {
        Object.assign(this, data);
        if (!this.id) {
            this.id = this.generateUUID();
        }
        const now = new Date();
        if (!this.createdAt) {
            this.createdAt = now;
        }
        if (!this.updatedAt) {
            this.updatedAt = now;
        }
        if (!this.lastAccessedAt) {
            this.lastAccessedAt = now;
        }
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    updateLastAccessed() {
        this.lastAccessedAt = new Date();
        this.updatedAt = new Date();
    }
    updateSessionData(sessionData) {
        this.sessionData = sessionData;
        this.updatedAt = new Date();
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            imageUrl: this.imageUrl,
            gameSystemId: this.gameSystemId,
            sessionData: this.sessionData,
            lastAccessedAt: this.lastAccessedAt.toISOString(),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }
}
exports.World = World;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], World.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255, { message: 'World name must be between 1 and 255 characters' }),
    __metadata("design:type", String)
], World.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], World.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], World.prototype, "gameSystemId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], World.prototype, "sessionData", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], World.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], World.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], World.prototype, "updatedAt", void 0);
//# sourceMappingURL=world.entity.js.map