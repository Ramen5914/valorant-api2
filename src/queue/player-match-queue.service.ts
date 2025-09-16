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
  playerName: string;
  playerTag: string;
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
      playerName: player.name,
      playerTag: player.tag,
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
    const players = await this.playerRepository.find();

    console.log(`Adding ${players.length} players to the queue`);

    for (const player of players) {
      await this.addPlayerToQueue(player);
    }
  }

  async getQueueStats() {
    const waiting = await this.playerMatchQueue.getWaiting();
    const active = await this.playerMatchQueue.getActive();
    const completed = await this.playerMatchQueue.getCompleted();
    const failed = await this.playerMatchQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  // Add a player by their game name and tag
  async addPlayerByNameTag(
    name: string,
    tag: string,
    region: string,
  ): Promise<Player | null> {
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
            name: string;
            tag: string;
            card: { id: string };
            title: { id: string };
            preferred_level_border: { id: string };
            account_level: number;
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
      const newPlayer = new Player();
      newPlayer.id = playerData.puuid;
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
      newPlayer.premierTeam = null; // Will be set later if available
      newPlayer.region = region;

      const savedPlayer = await this.playerRepository.save(newPlayer);
      console.log(
        `Created and saved player ${name}#${tag} with PUUID ${playerData.puuid}`,
      );

      // Add to queue for match processing
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
      newPlayer.premierTeam = null;
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
