import { Module } from '@nestjs/common';
import { WorldsController } from './worlds.controller';
import { LaunchController } from './launch.controller';
import { WorldsService } from './worlds.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WorldsController, LaunchController],
  providers: [WorldsService],
  exports: [WorldsService],
})
export class WorldsModule {}