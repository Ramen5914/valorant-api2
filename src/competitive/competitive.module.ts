import { Module } from '@nestjs/common';
import { CompetitiveService } from './competitive.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { CompetitivePlayer } from './entities/playerStat.entity';
import { CompetitiveController } from './competitive.controller';
import { ExternalModule } from '../external/external.module';
import { CompetitiveMatch } from './entities/competitive.entity';
import { Player } from 'src/player/entities/player.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompetitiveMatch,
      Team,
      CompetitivePlayer,
      Player,
    ]),
    ExternalModule,
  ],
  controllers: [CompetitiveController],
  providers: [CompetitiveService],
  exports: [CompetitiveService],
})
export class CompetitiveModule {}
