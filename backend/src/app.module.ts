import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { GameSystemsController } from './controllers/game-systems.controller';
import { DocumentsController } from './controllers/documents.controller';
import { GameSystemService } from './services/game-system.service';
import { DocumentService } from './services/document.service';
import { ValidationService } from './services/validation.service';
import { FileStorageService } from './services/file-storage.service';
import { LockService } from './services/lock.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    }),
  ],
  controllers: [GameSystemsController, DocumentsController],
  providers: [
    GameSystemService,
    DocumentService,
    ValidationService,
    FileStorageService,
    LockService,
  ],
  exports: [
    GameSystemService,
    DocumentService,
    ValidationService,
    FileStorageService,
    LockService,
  ],
})
export class AppModule {}