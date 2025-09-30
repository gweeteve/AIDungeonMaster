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
exports.GameSystem = void 0;
const class_validator_1 = require("class-validator");
class GameSystem {
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
        if (this.isActive === undefined) {
            this.isActive = true;
        }
        if (!this.rulesetConfig) {
            this.rulesetConfig = {};
        }
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    activate() {
        this.isActive = true;
        this.updatedAt = new Date();
    }
    deactivate() {
        this.isActive = false;
        this.updatedAt = new Date();
    }
    updateRuleset(rulesetConfig) {
        this.rulesetConfig = rulesetConfig;
        this.updatedAt = new Date();
    }
    updateDescription(description) {
        this.description = description;
        this.updatedAt = new Date();
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            defaultImageUrl: this.defaultImageUrl,
            description: this.description,
            rulesetConfig: this.rulesetConfig,
            isActive: this.isActive,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }
    toSummary() {
        return {
            id: this.id,
            name: this.name,
            defaultImageUrl: this.defaultImageUrl
        };
    }
    toResponse() {
        return {
            id: this.id,
            name: this.name,
            defaultImageUrl: this.defaultImageUrl,
            description: this.description,
            isActive: this.isActive
        };
    }
}
exports.GameSystem = GameSystem;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GameSystem.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100, { message: 'Game system name must be between 1 and 100 characters' }),
    __metadata("design:type", String)
], GameSystem.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({}, { message: 'Default image URL must be a valid URL' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameSystem.prototype, "defaultImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 1000, { message: 'Description must be 1000 characters or less' }),
    __metadata("design:type", String)
], GameSystem.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GameSystem.prototype, "rulesetConfig", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GameSystem.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Date)
], GameSystem.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Date)
], GameSystem.prototype, "updatedAt", void 0);
//# sourceMappingURL=game-system.entity.js.map