"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldsModule = void 0;
const common_1 = require("@nestjs/common");
const worlds_controller_1 = require("./worlds.controller");
const launch_controller_1 = require("./launch.controller");
const worlds_service_1 = require("./worlds.service");
const database_module_1 = require("../database/database.module");
let WorldsModule = class WorldsModule {
};
exports.WorldsModule = WorldsModule;
exports.WorldsModule = WorldsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [worlds_controller_1.WorldsController, launch_controller_1.LaunchController],
        providers: [worlds_service_1.WorldsService],
        exports: [worlds_service_1.WorldsService],
    })
], WorldsModule);
//# sourceMappingURL=worlds.module.js.map