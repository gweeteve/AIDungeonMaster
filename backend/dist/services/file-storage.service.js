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
exports.FileStorageService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs/promises");
const path = require("path");
const uuid_1 = require("uuid");
let FileStorageService = class FileStorageService {
    constructor() {
        this.storageBasePath = path.join(process.cwd(), 'storage', 'documents');
        this.ensureStorageDirectory();
    }
    async ensureStorageDirectory() {
        try {
            await fs.mkdir(this.storageBasePath, { recursive: true });
        }
        catch (error) {
            console.error('Failed to create storage directory:', error);
        }
    }
    async storeFile(buffer, originalFilename, gameSystemId) {
        try {
            const gameSystemDir = path.join(this.storageBasePath, gameSystemId);
            await fs.mkdir(gameSystemDir, { recursive: true });
            const fileExtension = path.extname(originalFilename);
            const uniqueFilename = `${(0, uuid_1.v4)()}${fileExtension}`;
            const filePath = path.join(gameSystemDir, uniqueFilename);
            await fs.writeFile(filePath, buffer);
            return path.join(gameSystemId, uniqueFilename);
        }
        catch (error) {
            console.error('Failed to store file:', error);
            throw new common_1.InternalServerErrorException('Failed to store file');
        }
    }
    async getFile(relativePath) {
        try {
            const fullPath = path.join(this.storageBasePath, relativePath);
            const resolvedPath = path.resolve(fullPath);
            const resolvedStoragePath = path.resolve(this.storageBasePath);
            if (!resolvedPath.startsWith(resolvedStoragePath)) {
                throw new Error('Invalid file path');
            }
            return await fs.readFile(resolvedPath);
        }
        catch (error) {
            console.error('Failed to read file:', error);
            throw new common_1.InternalServerErrorException('Failed to read file');
        }
    }
    async deleteFile(relativePath) {
        try {
            const fullPath = path.join(this.storageBasePath, relativePath);
            const resolvedPath = path.resolve(fullPath);
            const resolvedStoragePath = path.resolve(this.storageBasePath);
            if (!resolvedPath.startsWith(resolvedStoragePath)) {
                throw new Error('Invalid file path');
            }
            await fs.unlink(resolvedPath);
        }
        catch (error) {
            console.error('Failed to delete file:', error);
        }
    }
    async fileExists(relativePath) {
        try {
            const fullPath = path.join(this.storageBasePath, relativePath);
            await fs.access(fullPath);
            return true;
        }
        catch {
            return false;
        }
    }
    async getFileInfo(relativePath) {
        try {
            const fullPath = path.join(this.storageBasePath, relativePath);
            const stats = await fs.stat(fullPath);
            return {
                size: stats.size,
                modified: stats.mtime,
            };
        }
        catch {
            return null;
        }
    }
    async moveFile(oldPath, newPath) {
        try {
            const fullOldPath = path.join(this.storageBasePath, oldPath);
            const fullNewPath = path.join(this.storageBasePath, newPath);
            const resolvedOldPath = path.resolve(fullOldPath);
            const resolvedNewPath = path.resolve(fullNewPath);
            const resolvedStoragePath = path.resolve(this.storageBasePath);
            if (!resolvedOldPath.startsWith(resolvedStoragePath) ||
                !resolvedNewPath.startsWith(resolvedStoragePath)) {
                throw new Error('Invalid file paths');
            }
            await fs.mkdir(path.dirname(fullNewPath), { recursive: true });
            await fs.rename(fullOldPath, fullNewPath);
        }
        catch (error) {
            console.error('Failed to move file:', error);
            throw new common_1.InternalServerErrorException('Failed to move file');
        }
    }
    async copyFile(sourcePath, destPath) {
        try {
            const fullSourcePath = path.join(this.storageBasePath, sourcePath);
            const fullDestPath = path.join(this.storageBasePath, destPath);
            const resolvedSourcePath = path.resolve(fullSourcePath);
            const resolvedDestPath = path.resolve(fullDestPath);
            const resolvedStoragePath = path.resolve(this.storageBasePath);
            if (!resolvedSourcePath.startsWith(resolvedStoragePath) ||
                !resolvedDestPath.startsWith(resolvedStoragePath)) {
                throw new Error('Invalid file paths');
            }
            await fs.mkdir(path.dirname(fullDestPath), { recursive: true });
            await fs.copyFile(fullSourcePath, fullDestPath);
        }
        catch (error) {
            console.error('Failed to copy file:', error);
            throw new common_1.InternalServerErrorException('Failed to copy file');
        }
    }
    async cleanupOrphanedFiles(validPaths) {
        try {
            const allFiles = await this.getAllFiles(this.storageBasePath);
            const validFullPaths = validPaths.map(p => path.join(this.storageBasePath, p));
            for (const filePath of allFiles) {
                if (!validFullPaths.includes(filePath)) {
                    try {
                        await fs.unlink(filePath);
                        console.log(`Cleaned up orphaned file: ${filePath}`);
                    }
                    catch (error) {
                        console.error(`Failed to clean up file ${filePath}:`, error);
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to cleanup orphaned files:', error);
        }
    }
    async getAllFiles(dirPath) {
        const files = [];
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    const subFiles = await this.getAllFiles(fullPath);
                    files.push(...subFiles);
                }
                else {
                    files.push(fullPath);
                }
            }
        }
        catch (error) {
            console.error(`Failed to read directory ${dirPath}:`, error);
        }
        return files;
    }
};
exports.FileStorageService = FileStorageService;
exports.FileStorageService = FileStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FileStorageService);
//# sourceMappingURL=file-storage.service.js.map