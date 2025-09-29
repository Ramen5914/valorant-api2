import { Controller, Post, Get, Body } from '@nestjs/common';
import { QueueSchedulerService } from './queue-scheduler.service';
import { PlayerMatchQueueService } from './player-match-queue.service';

@Controller('queue')
export class QueueController {
  constructor(
    private readonly queueSchedulerService: QueueSchedulerService,
    private readonly queueService: PlayerMatchQueueService,
  ) {}

  @Post('trigger')
  async triggerManualQueue() {
    await this.queueSchedulerService.triggerManualQueue();
    return { message: 'Queue triggered successfully' };
  }

  @Get('status')
  async getQueueStatus() {
    const stats = await this.queueSchedulerService.getQueueStatus();
    return { status: 'success', data: stats };
  }

  @Post('add-all-players')
  async addAllPlayersToQueue() {
    await this.queueService.addAllPlayersToQueue();
    return { message: 'All players added to queue successfully' };
  }

  @Post('add-player')
  async addPlayerByName(@Body() body: { name: string; tag: string }) {
    await this.queueService.addPlayerByNameTag(body.name, body.tag);
  }

  @Get('stats')
  async getQueueStats() {
    const stats = await this.queueService.getQueueStats();
    return { status: 'success', data: stats };
  }
}
