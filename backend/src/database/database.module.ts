import { Module } from '@nestjs/common';
import { LiteDbService } from './litedb.service';

@Module({
  providers: [LiteDbService],
  exports: [LiteDbService],
})
export class DatabaseModule {}