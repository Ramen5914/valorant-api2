import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PlayerMatchQueueService } from './player-match-queue.service';
import { PlayerMatchProcessor } from './player-match.processor';
import { Player } from '../player/entities/player.entity';
import { QueueSchedulerService } from './queue-scheduler.service';
import { QueueController } from './queue.controller';
import { CompetitiveModule } from '../competitive/competitive.module';
import { PlayerModule } from 'src/player/player.module';
import { CompetitiveMatch } from 'src/competitive/entities/competitive.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'player-matches',
    }),
    HttpModule,
    TypeOrmModule.forFeature([Player, CompetitiveMatch]),
    ScheduleModule.forRoot(),
    ConfigModule,
    CompetitiveModule,
    PlayerModule,
  ],
  controllers: [QueueController],
  providers: [
    PlayerMatchQueueService,
    PlayerMatchProcessor,
    QueueSchedulerService,
  ],
  exports: [PlayerMatchQueueService],
})
export class QueueModule {}
