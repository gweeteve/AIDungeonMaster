"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const game_systems_controller_1 = require("./controllers/game-systems.controller");
const documents_controller_1 = require("./controllers/documents.controller");
const game_system_service_1 = require("./services/game-system.service");
const document_service_1 = require("./services/document.service");
const validation_service_1 = require("./services/validation.service");
const file_storage_service_1 = require("./services/file-storage.service");
const lock_service_1 = require("./services/lock.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                limits: {
                    fileSize: 100 * 1024 * 1024,
                },
            }),
        ],
        controllers: [game_systems_controller_1.GameSystemsController, documents_controller_1.DocumentsController],
        providers: [
            game_system_service_1.GameSystemService,
            document_service_1.DocumentService,
            validation_service_1.ValidationService,
            file_storage_service_1.FileStorageService,
            lock_service_1.LockService,
        ],
        exports: [
            game_system_service_1.GameSystemService,
            document_service_1.DocumentService,
            validation_service_1.ValidationService,
            file_storage_service_1.FileStorageService,
            lock_service_1.LockService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map