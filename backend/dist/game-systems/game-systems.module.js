"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSystemsModule = void 0;
const common_1 = require("@nestjs/common");
const game_systems_controller_1 = require("./game-systems.controller");
const game_systems_service_1 = require("./game-systems.service");
const database_module_1 = require("../database/database.module");
let GameSystemsModule = class GameSystemsModule {
};
exports.GameSystemsModule = GameSystemsModule;
exports.GameSystemsModule = GameSystemsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [game_systems_controller_1.GameSystemsController],
        providers: [game_systems_service_1.GameSystemsService],
        exports: [game_systems_service_1.GameSystemsService],
    })
], GameSystemsModule);
//# sourceMappingURL=game-systems.module.js.map