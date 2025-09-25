import { Module } from '@nestjs/common';
import { CompetitiveService } from './competitive.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competitive } from './entities/competitive.entity';
import { Team } from './entities/team.entity';
import { CompetitivePlayer } from './entities/playerStat.entity';
import { CompetitiveController } from './competitive.controller';
import { ExternalModule } from '../external/external.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Competitive, Team, CompetitivePlayer]),
    ExternalModule,
  ],
  controllers: [CompetitiveController],
  providers: [CompetitiveService],
  exports: [CompetitiveService],
})
export class CompetitiveModule {}
