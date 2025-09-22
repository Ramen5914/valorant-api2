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
  async addPlayerByNameTag(
    @Body() body: { name: string; tag: string; region: string },
  ) {
    const { name, tag, region } = body;

    if (!name || !tag || !region) {
      return {
        status: 'error',
        message: 'Name, tag, and region are required',
      };
    }

    const player = await this.queueService.addPlayerByNameTag(
      name,
      tag,
      region,
    );

    if (player) {
      return {
        status: 'success',
        message: `Player ${name}#${tag} added successfully`,
        data: player,
      };
    } else {
      return {
        status: 'error',
        message: `Failed to add player ${name}#${tag}`,
      };
    }
  }

  @Post('add-player-by-puuid')
  async addPlayerByPuuid(@Body() body: { puuid: string; region: string }) {
    const { puuid, region } = body;

    if (!puuid || !region) {
      return {
        status: 'error',
        message: 'PUUID and region are required',
      };
    }

    const player = await this.queueService.addPlayerByPuuid(puuid, region);

    if (player) {
      return {
        status: 'success',
        message: `Player added successfully`,
        data: player,
      };
    } else {
      return {
        status: 'error',
        message: `Failed to add player with PUUID ${puuid}`,
      };
    }
  }

  @Get('stats')
  async getQueueStats() {
    const stats = await this.queueService.getQueueStats();
    return { status: 'success', data: stats };
  }

  @Get('health')
  async getHealth() {
    return {
      status: 'success',
      message: 'Queue controller is responsive',
      timestamp: new Date().toISOString(),
    };
  }
}
