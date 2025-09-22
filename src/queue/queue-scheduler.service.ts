import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PlayerMatchQueueService } from './player-match-queue.service';

@Injectable()
export class QueueSchedulerService {
  constructor(private readonly queueService: PlayerMatchQueueService) {}

  @Cron('*/5 * * * *')
  async handleQueueAllPlayers() {
    console.log('Starting player queue population...');

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
