import { Module } from '@nestjs/common';
import { CompetitiveService } from './competitive.service';

@Module({
  providers: [CompetitiveService],
})
export class CompetitiveModule {}
