import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PlayerMatchQueueService } from './player-match-queue.service';
import { PlayerMatchProcessor } from './player-match.processor';
import { Account } from '../account/entities/account.entity';
import { QueueSchedulerService } from './queue-scheduler.service';
import { QueueController } from './queue.controller';
import { CompetitiveModule } from '../competitive/competitive.module';
import { AccountModule } from 'src/account/account.module';
import { ExternalModule } from 'src/external/external.module';
import { Match } from 'src/competitive/entities/match.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'player-matches',
    }),
    HttpModule,
    TypeOrmModule.forFeature([Account, Match]),
    ScheduleModule.forRoot(),
    ConfigModule,
    CompetitiveModule,
    AccountModule,
    ExternalModule,
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
