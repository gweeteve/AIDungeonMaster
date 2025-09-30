import { Module } from '@nestjs/common';
import { GameSystemsController } from './game-systems.controller';
import { GameSystemsService } from './game-systems.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GameSystemsController],
  providers: [GameSystemsService],
  exports: [GameSystemsService],
})
export class GameSystemsModule {}