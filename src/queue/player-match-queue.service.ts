import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import type { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Player } from '../player/entities/player.entity';

export interface PlayerMatchJobData {
  playerId: string;
  region: string;
}

@Injectable()
export class PlayerMatchQueueService {
  constructor(
    @InjectQueue('player-matches') private playerMatchQueue: Queue,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async addPlayerToQueue(player: Player): Promise<void> {
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
    const players = await this.playerRepository.find({
      select: {
        id: true,
        region: true,
      },
    });

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
  } // Add a player by their game name and tag
  async addPlayerByNameTag(name: string, tag: string): Promise<Player | null> {
    try {
      const apiKey = this.configService.get<string>('HENRIK_API_KEY');
      if (!apiKey) {
        throw new Error('HENRIK_API_KEY not configured');
      }

      // Fetch player account info from Henrik API
      const response = await firstValueFrom(
        this.httpService.get<{
          data: {
            puuid: string;
            region: string;
            account_level: number;
            name: string;
            tag: string;
            card: string;
            title: string;
            platforms: string[];
            updated_at: string;
          };
        }>(`https://api.henrikdev.xyz/valorant/v2/account/${name}/${tag}`, {
          headers: {
            Authorization: apiKey,
          },
        }),
      );

      if (!response.data?.data) {
        console.log(`Player ${name}#${tag} not found`);
        return null;
      }

      const playerData = response.data.data;

      // Check if player already exists
      const existingPlayer = await this.playerRepository.findOne({
        where: { id: playerData.puuid },
      });

      if (existingPlayer) {
        console.log(`Player ${name}#${tag} already exists in database`);
        // Add to queue anyway
        await this.addPlayerToQueue(existingPlayer);
        return existingPlayer;
      }

      // Create new player
      const newPlayer = this.playerRepository.create({
        id: playerData.puuid,
        name: playerData.name,
        tag: playerData.tag,
        playerCard: playerData.card,
        title: playerData.title,
        preferredLevelBorder: null,
        accountLevel: playerData.account_level,
        region: playerData.region,
        rosterId: null,
      });

      const savedPlayer = await this.playerRepository.save(newPlayer);
      console.log(
        `Created and saved player ${name}#${tag} with PUUID ${playerData.puuid}`,
      );

      await this.addPlayerToQueue(savedPlayer);

      return savedPlayer;
    } catch (error) {
      console.error(
        `Failed to add player ${name}#${tag}:`,
        (error as Error).message,
      );
      return null;
    }
  }

  // Add a player directly by PUUID (useful if you already have the PUUID)
  async addPlayerByPuuid(
    puuid: string,
    region: string,
  ): Promise<Player | null> {
    try {
      const apiKey = this.configService.get<string>('HENRIK_API_KEY');
      if (!apiKey) {
        throw new Error('HENRIK_API_KEY not configured');
      }

      // Fetch player account info from Henrik API using PUUID
      const response = await firstValueFrom(
        this.httpService.get<{
          data: {
            puuid: string;
            name: string;
            tag: string;
            card: { id: string };
            title: { id: string };
            preferred_level_border: { id: string };
            account_level: number;
          };
        }>(`https://api.henrikdev.xyz/valorant/v1/by-puuid/account/${puuid}`, {
          headers: {
            Authorization: apiKey,
          },
        }),
      );

      if (!response.data?.data) {
        console.log(`Player with PUUID ${puuid} not found`);
        return null;
      }

      const playerData = response.data.data;

      // Check if player already exists
      const existingPlayer = await this.playerRepository.findOne({
        where: { id: puuid },
      });

      if (existingPlayer) {
        console.log(
          `Player ${playerData.name}#${playerData.tag} already exists in database`,
        );
        // Add to queue anyway
        await this.addPlayerToQueue(existingPlayer);
        return existingPlayer;
      }

      // Create new player
      const newPlayer = new Player();
      newPlayer.id = puuid;
      newPlayer.name = playerData.name;
      newPlayer.tag = playerData.tag;
      newPlayer.playerCard =
        playerData.card?.id || '00000000-0000-0000-0000-000000000000';
      newPlayer.title =
        playerData.title?.id || '00000000-0000-0000-0000-000000000000';
      newPlayer.preferredLevelBorder =
        playerData.preferred_level_border?.id ||
        '00000000-0000-0000-0000-000000000000';
      newPlayer.accountLevel = playerData.account_level || 1;
      newPlayer.rosterId = null;
      newPlayer.region = region;

      const savedPlayer = await this.playerRepository.save(newPlayer);
      console.log(
        `Created and saved player ${playerData.name}#${playerData.tag} with PUUID ${puuid}`,
      );

      // Add to queue for match processing
      await this.addPlayerToQueue(savedPlayer);

      return savedPlayer;
    } catch (error) {
      console.error(
        `Failed to add player with PUUID ${puuid}:`,
        (error as Error).message,
      );
      return null;
    }
  }
}
