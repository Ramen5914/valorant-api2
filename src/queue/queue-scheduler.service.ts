import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PlayerMatchQueueService } from './player-match-queue.service';

@Injectable()
export class QueueSchedulerService {
  constructor(private readonly queueService: PlayerMatchQueueService) {}

  // Run every day at 2 AM to fetch matches for all players
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleQueueAllPlayers() {
    console.log('Starting daily player queue population...');

    try {
      await this.queueService.addAllPlayersToQueue();
      console.log('Successfully added all players to queue');
    } catch (error) {
      console.error(
        'Failed to add players to queue:',
        (error as Error).message,
      );
    }
  }

  // Optional: Manual trigger endpoint (you can call this method from a controller)
  async triggerManualQueue() {
    console.log('Manual queue trigger initiated...');
    await this.queueService.addAllPlayersToQueue();
  }

  // Get queue statistics
  async getQueueStatus() {
    return await this.queueService.getQueueStats();
  }
}
