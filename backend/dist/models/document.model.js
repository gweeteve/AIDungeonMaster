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
exports.Document = exports.DocumentType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var DocumentType;
(function (DocumentType) {
    DocumentType["JSON"] = "JSON";
    DocumentType["PDF"] = "PDF";
    DocumentType["MARKDOWN"] = "MARKDOWN";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
class Document {
    constructor() {
        this.id = '';
        this.gameSystemId = '';
        this.filename = '';
        this.displayName = '';
        this.type = DocumentType.JSON;
        this.filePath = '';
        this.fileSize = 0;
        this.mimeType = '';
        this.uploadedBy = '';
        this.checksum = '';
        this.validationErrors = [];
        this.tags = [];
        this.version = 1;
        this.isActive = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}
exports.Document = Document;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], Document.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], Document.prototype, "gameSystemId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], Document.prototype, "filename", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], Document.prototype, "displayName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(DocumentType),
    __metadata("design:type", String)
], Document.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Document.prototype, "filePath", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Document.prototype, "fileSize", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Document.prototype, "mimeType", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], Document.prototype, "uploadedBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Document.prototype, "checksum", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], Document.prototype, "validationErrors", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], Document.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], Document.prototype, "version", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Document.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], Document.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], Document.prototype, "updatedAt", void 0);
//# sourceMappingURL=document.model.js.map