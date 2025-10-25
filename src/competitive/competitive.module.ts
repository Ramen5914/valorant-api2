import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BombEvent } from './entities/bombEvent.entity';
import { DamageEvent } from './entities/damageEvent.entity';
import { Match } from './entities/match.entity';
import { Player } from './entities/player.entity';
import { KillPlayerLocation } from './entities/killPlayerLocation.entity';
import { Round } from './entities/round.entity';
import { KillEvent } from './entities/killEvent.entity';
import { Team } from './entities/team.entity';
import { ExternalModule } from 'src/external/external.module';
import { CompetitiveController } from './competitive.controller';
import { CompetitiveService } from './competitive.service';
import { BombPlayerLocation } from './entities/bombPlayerLocation.entity';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BombEvent,
      BombPlayerLocation,
      DamageEvent,
      KillEvent,
      KillPlayerLocation,
      Match,
      Player,
      Round,
      Team,
    ]),
    ExternalModule,
    AccountModule,
  ],
  controllers: [CompetitiveController],
  providers: [CompetitiveService],
  exports: [CompetitiveService],
})
export class CompetitiveModule {}
