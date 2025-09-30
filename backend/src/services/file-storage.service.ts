import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileStorageService {
  private readonly storageBasePath: string;

  constructor() {
    // Use a storage directory relative to the project root
    this.storageBasePath = path.join(process.cwd(), 'storage', 'documents');
    this.ensureStorageDirectory();
  }

  private async ensureStorageDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.storageBasePath, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
    }
  }

  async storeFile(buffer: Buffer, originalFilename: string, gameSystemId: string): Promise<string> {
    try {
      // Create game system subdirectory
      const gameSystemDir = path.join(this.storageBasePath, gameSystemId);
      await fs.mkdir(gameSystemDir, { recursive: true });

      // Generate unique filename to prevent conflicts
      const fileExtension = path.extname(originalFilename);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(gameSystemDir, uniqueFilename);

      // Write file to disk
      await fs.writeFile(filePath, buffer);

      // Return relative path for storage in database
      return path.join(gameSystemId, uniqueFilename);
    } catch (error) {
      console.error('Failed to store file:', error);
      throw new InternalServerErrorException('Failed to store file');
    }
  }

  async getFile(relativePath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.storageBasePath, relativePath);
      
      // Verify file exists and is within storage directory (security check)
      const resolvedPath = path.resolve(fullPath);
      const resolvedStoragePath = path.resolve(this.storageBasePath);
      
      if (!resolvedPath.startsWith(resolvedStoragePath)) {
        throw new Error('Invalid file path');
      }

      return await fs.readFile(resolvedPath);
    } catch (error) {
      console.error('Failed to read file:', error);
      throw new InternalServerErrorException('Failed to read file');
    }
  }

  async deleteFile(relativePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.storageBasePath, relativePath);
      
      // Verify file path is within storage directory (security check)
      const resolvedPath = path.resolve(fullPath);
      const resolvedStoragePath = path.resolve(this.storageBasePath);
      
      if (!resolvedPath.startsWith(resolvedStoragePath)) {
        throw new Error('Invalid file path');
      }

      await fs.unlink(resolvedPath);
    } catch (error) {
      console.error('Failed to delete file:', error);
      // Don't throw error for file deletion failures
      // as the main operation might still be successful
    }
  }

  async fileExists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.storageBasePath, relativePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileInfo(relativePath: string): Promise<{ size: number; modified: Date } | null> {
    try {
      const fullPath = path.join(this.storageBasePath, relativePath);
      const stats = await fs.stat(fullPath);
      
      return {
        size: stats.size,
        modified: stats.mtime,
      };
    } catch {
      return null;
    }
  }

  async moveFile(oldPath: string, newPath: string): Promise<void> {
    try {
      const fullOldPath = path.join(this.storageBasePath, oldPath);
      const fullNewPath = path.join(this.storageBasePath, newPath);
      
      // Verify both paths are within storage directory
      const resolvedOldPath = path.resolve(fullOldPath);
      const resolvedNewPath = path.resolve(fullNewPath);
      const resolvedStoragePath = path.resolve(this.storageBasePath);
      
      if (!resolvedOldPath.startsWith(resolvedStoragePath) || 
          !resolvedNewPath.startsWith(resolvedStoragePath)) {
        throw new Error('Invalid file paths');
      }

      // Ensure destination directory exists
      await fs.mkdir(path.dirname(fullNewPath), { recursive: true });
      
      await fs.rename(fullOldPath, fullNewPath);
    } catch (error) {
      console.error('Failed to move file:', error);
      throw new InternalServerErrorException('Failed to move file');
    }
  }

  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      const fullSourcePath = path.join(this.storageBasePath, sourcePath);
      const fullDestPath = path.join(this.storageBasePath, destPath);
      
      // Verify both paths are within storage directory
      const resolvedSourcePath = path.resolve(fullSourcePath);
      const resolvedDestPath = path.resolve(fullDestPath);
      const resolvedStoragePath = path.resolve(this.storageBasePath);
      
      if (!resolvedSourcePath.startsWith(resolvedStoragePath) || 
          !resolvedDestPath.startsWith(resolvedStoragePath)) {
        throw new Error('Invalid file paths');
      }

      // Ensure destination directory exists
      await fs.mkdir(path.dirname(fullDestPath), { recursive: true });
      
      await fs.copyFile(fullSourcePath, fullDestPath);
    } catch (error) {
      console.error('Failed to copy file:', error);
      throw new InternalServerErrorException('Failed to copy file');
    }
  }

  // Utility method to clean up orphaned files
  async cleanupOrphanedFiles(validPaths: string[]): Promise<void> {
    try {
      const allFiles = await this.getAllFiles(this.storageBasePath);
      const validFullPaths = validPaths.map(p => path.join(this.storageBasePath, p));
      
      for (const filePath of allFiles) {
        if (!validFullPaths.includes(filePath)) {
          try {
            await fs.unlink(filePath);
            console.log(`Cleaned up orphaned file: ${filePath}`);
          } catch (error) {
            console.error(`Failed to clean up file ${filePath}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup orphaned files:', error);
    }
  }

  private async getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getAllFiles(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Failed to read directory ${dirPath}:`, error);
    }
    
    return files;
  }
}