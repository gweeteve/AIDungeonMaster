export declare class FileStorageService {
    private readonly storageBasePath;
    constructor();
    private ensureStorageDirectory;
    storeFile(buffer: Buffer, originalFilename: string, gameSystemId: string): Promise<string>;
    getFile(relativePath: string): Promise<Buffer>;
    deleteFile(relativePath: string): Promise<void>;
    fileExists(relativePath: string): Promise<boolean>;
    getFileInfo(relativePath: string): Promise<{
        size: number;
        modified: Date;
    } | null>;
    moveFile(oldPath: string, newPath: string): Promise<void>;
    copyFile(sourcePath: string, destPath: string): Promise<void>;
    cleanupOrphanedFiles(validPaths: string[]): Promise<void>;
    private getAllFiles;
}
