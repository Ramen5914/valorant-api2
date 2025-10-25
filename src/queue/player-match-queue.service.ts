import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Account } from '../account/entities/account.entity';
import { ExternalService } from 'src/external/external.service';
import { AccountService } from 'src/account/account.service';

export interface PlayerMatchJobData {
  playerId: string;
  region: string;
}

@Injectable()
export class PlayerMatchQueueService {
  constructor(
    @InjectQueue('player-matches') private playerMatchQueue: Queue,
    private readonly externalService: ExternalService,
    private readonly playerService: AccountService,
  ) {}

  async addPlayerToQueue(player: Account): Promise<void> {
    const jobData: PlayerMatchJobData = {
      playerId: player.id,
      region: player.region,
    };

    await this.playerMatchQueue.add('fetch-player-matches', jobData, {
      attempts: 3,
      delay: 1000, // 1 second delay between jobs to avoid rate limiting
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    console.log(`Added player ${player.name}#${player.tag} to queue`);
  }

  async addAllPlayersToQueue(): Promise<void> {
    const players = [];

    console.log(`Adding ${players.length} players to the queue`);

    for (const player of players) {
      await this.addPlayerToQueue(player);
    }
  }

  async getQueueStats() {
    try {
      // Add timeout to prevent hanging
      const timeout = 5000; // 5 seconds timeout

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Queue stats timeout')), timeout),
      );

      const statsPromise = Promise.all([
        this.playerMatchQueue.getWaiting(),
        this.playerMatchQueue.getActive(),
        this.playerMatchQueue.getCompleted(),
        this.playerMatchQueue.getFailed(),
      ]);

      const [waiting, active, completed, failed] = await Promise.race([
        statsPromise,
        timeoutPromise,
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      };
    } catch (error) {
      console.error('Failed to get queue stats:', (error as Error).message);
      // Return fallback stats if Redis/queue is not accessible
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        error: 'Unable to connect to queue system',
      };
    }
  }

  async addPlayerByNameTag(name: string, tag: string): Promise<Account> {
    const account = await this.externalService.getAccountByName(name, tag);

    const existingPlayer = await this.playerService.getAccountById(
      account.puuid,
    );

    if (existingPlayer) {
      await this.addPlayerToQueue(existingPlayer);
      return existingPlayer;
    } else {
      const newPlayer = await this.playerService.createPlayer(
        account.puuid,
        account.name,
        account.tag,
        account.card,
        account.title,
        account.account_level,
        account.region,
      );

      await this.addPlayerToQueue(newPlayer);
      return newPlayer;
    }
  }
}
