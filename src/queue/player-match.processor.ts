import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { Job } from 'bull';
import { firstValueFrom } from 'rxjs';
import { Player } from '../player/entities/player.entity';
import { PlayerMatchJobData } from './player-match-queue.service';
import { CompetitiveService } from '../competitive/competitive.service';
import { CompetitiveSchema as CompetitiveSchema } from '../competitive/competitive.schema';
import { z } from 'zod';

type MatchSchema = z.infer<typeof CompetitiveSchema>;

interface HenrikPlayerProfileResponse {
  status: number;
  data: {
    puuid: string;
    name: string;
    tag: string;
    card?: {
      small: string;
      large: string;
      wide: string;
      id: string;
    };
    player_title?: string;
    account_level?: number;
  };
}

@Processor('player-matches')
@Injectable()
export class PlayerMatchProcessor {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    private readonly competitiveService: CompetitiveService,
  ) {}

  @Process('fetch-player-matches')
  async handlePlayerMatches(job: Job<PlayerMatchJobData>) {
    const { playerId, playerName, playerTag, region } = job.data;

    try {
      console.log(`Processing matches for player: ${playerName}#${playerTag}`);

      // Fetch match IDs from Valorant API
      const matchIds = await this.fetchPlayerMatches(
        playerName,
        playerTag,
        region,
        playerId, // Pass the PUUID directly
      );

      if (!matchIds || matchIds.length === 0) {
        console.log(`No matches found for player: ${playerName}#${playerTag}`);
        return;
      }

      // Process and store each match
      for (const matchId of matchIds) {
        await this.processAndStoreMatch(matchId, region);
        // Add delay between match processing to avoid rate limiting
        await this.delay(500); // 500ms delay between match fetches
      }

      console.log(
        `Successfully processed ${matchIds.length} matches for ${playerName}#${playerTag}`,
      );
    } catch (error) {
      console.error(
        `Failed to process matches for ${playerName}#${playerTag}:`,
        (error as Error).message,
      );
      throw error; // This will mark the job as failed and trigger retries
    }
  }
  private async fetchPlayerMatches(
    name: string,
    tag: string,
    region: string,
    puuid: string,
  ): Promise<string[]> {
    try {
      const apiKey = this.configService.get<string>('HENRIK_API_KEY');
      if (!apiKey) {
        throw new Error('HENRIK_API_KEY not configured');
      }

      console.log(
        `Fetching matches for ${name}#${tag} (PUUID: ${puuid}) in region: ${region}`,
      );

      // Use Henrik's raw endpoint with matchhistory type for PUUID
      const matchListResponse = await firstValueFrom(
        this.httpService.post<any>(
          `https://api.henrikdev.xyz/valorant/v1/raw`,
          {
            type: 'matchhistory',
            value: puuid,
            region: region,
            queries: '?queue=competitive',
          },
          {
            headers: {
              Authorization: apiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (
        !matchListResponse.data?.data?.History ||
        !Array.isArray(matchListResponse.data.data.History)
      ) {
        console.log('No match history data or data is not an array');
        return [];
      }

      // All matches should already be competitive due to the query filter
      const competitiveMatches = matchListResponse.data.data.History.filter(
        (match: any) => match.QueueID === 'competitive',
      );

      console.log(`Competitive matches found: ${competitiveMatches.length}`);

      return competitiveMatches
        .map((match: any) => match.MatchID)
        .filter(Boolean);
    } catch (error) {
      console.error(
        `Failed to fetch matches from API for ${name}#${tag}:`,
        (error as Error).message,
      );
      return [];
    }
  }
  private async processAndStoreMatch(
    matchId: string,
    region: string,
  ): Promise<void> {
    try {
      // Fetch full match details using Henrik's raw endpoint (returns Riot API format)
      const matchData = await this.fetchRiotMatchDetails(matchId, region);
      if (!matchData) {
        console.log(`Could not fetch details for match ${matchId}`);
        return;
      }

      console.log(`Match details for ${matchId}:`, {
        seasonId: matchData.matchInfo.seasonId,
        mapId: matchData.matchInfo.mapId,
        startTime: new Date(matchData.matchInfo.gameStartMillis),
      });

      // Use the competitive service to create the match (no transformation needed!)
      await this.competitiveService.createMatch(matchData);
      console.log(
        `Successfully processed match ${matchId} using CompetitiveService`,
      );

      // Extract and save all players from this match
      await this.extractAndSavePlayersFromRiotData(matchData, region);
    } catch (error) {
      console.error(
        `Failed to store match ${matchId}:`,
        (error as Error).message,
      );
      // Don't throw here - we want to continue processing other matches
    }
  }

  private async fetchRiotMatchDetails(
    matchId: string,
    region: string,
  ): Promise<MatchSchema | null> {
    try {
      const apiKey = this.configService.get<string>('HENRIK_API_KEY');
      if (!apiKey) {
        throw new Error('HENRIK_API_KEY not configured');
      }

      const response = await firstValueFrom(
        this.httpService.post<{ status: number; data: MatchSchema }>(
          `https://api.henrikdev.xyz/valorant/v1/raw`,
          {
            type: 'matchdetails',
            value: matchId,
            region: region,
          },
          {
            headers: {
              Authorization: apiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // Henrik API returns data wrapped in a data property
      return response.data.data;
    } catch (error) {
      console.error(
        `Failed to fetch match details for ${matchId}:`,
        (error as Error).message,
      );
      return null;
    }
  }

  private calculateMatchDuration(roundsPlayed: number): string {
    // Estimate match duration based on rounds played
    // Average round time is about 2-3 minutes, plus setup time
    const averageRoundMinutes = 2.5;
    const setupMinutes = 5;
    const totalMinutes = Math.floor(
      roundsPlayed * averageRoundMinutes + setupMinutes,
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours} hours ${minutes} minutes`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async extractAndSavePlayersFromRiotData(
    matchData: MatchSchema,
    region: string,
  ): Promise<void> {
    try {
      const players = matchData.players;
      console.log(`Extracting ${players.length} players from match...`);

      for (const player of players) {
        try {
          // Check if player already exists
          const existingPlayer = await this.playerRepository.findOne({
            where: { id: player.subject },
          });

          if (existingPlayer) {
            console.log(
              `Player ${player.gameName}#${player.tagLine} already exists, skipping...`,
            );
            continue;
          }

          // Fetch full player profile to get complete data
          const playerProfile = await this.fetchPlayerProfile(
            player.gameName,
            player.tagLine,
            region,
          );

          if (!playerProfile) {
            console.log(
              `Could not fetch profile for ${player.gameName}#${player.tagLine}, skipping...`,
            );
            continue;
          }

          console.log(
            `Player profile response for ${player.gameName}#${player.tagLine}:`,
            JSON.stringify(playerProfile.data, null, 2),
          );

          // Create new player entity with profile data
          const newPlayer = new Player();
          newPlayer.id = playerProfile.data.puuid;
          newPlayer.name = playerProfile.data.name;
          newPlayer.tag = playerProfile.data.tag;

          // Safely handle potentially missing fields
          try {
            newPlayer.playerCard = playerProfile.data.card?.small || '';
          } catch (cardError) {
            console.warn(
              `Failed to set player card for ${player.gameName}#${player.tagLine}:`,
              (cardError as Error).message,
            );
            newPlayer.playerCard = '';
          }

          newPlayer.title = playerProfile.data.player_title || '';
          newPlayer.preferredLevelBorder = '';
          newPlayer.accountLevel = playerProfile.data.account_level || 0;
          newPlayer.rosterId = null;
          newPlayer.region = region;

          await this.playerRepository.save(newPlayer);
          console.log(`Added new player: ${player.gameName}#${player.tagLine}`);

          // Add delay to avoid rate limiting
          await this.delay(1000); // 1 second delay between player profile fetches
        } catch (playerError) {
          console.error(
            `Failed to add player ${player.gameName}#${player.tagLine}:`,
            (playerError as Error).message,
          );
          // Continue with other players
        }
      }
    } catch (error) {
      console.error(
        'Failed to extract players from match:',
        (error as Error).message,
      );
    }
  }

  private async fetchPlayerProfile(
    name: string,
    tag: string,
    region: string,
  ): Promise<HenrikPlayerProfileResponse | null> {
    try {
      const apiKey = this.configService.get<string>('HENRIK_API_KEY');
      if (!apiKey) {
        throw new Error('HENRIK_API_KEY not configured');
      }

      const url = `https://api.henrikdev.xyz/valorant/v2/account/${name}/${tag}`;
      console.log(`Fetching player profile: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: apiKey,
          },
        }),
      );

      console.log(
        `Raw player profile response for ${name}#${tag}:`,
        JSON.stringify(response.data, null, 2),
      );
      return response.data as HenrikPlayerProfileResponse;
    } catch (error) {
      console.error(
        `Failed to fetch player profile for ${name}#${tag}:`,
        (error as Error).message,
      );
      return null;
    }
  }

  private convertGameLengthToInterval(gameLengthMs: number): string {
    const totalSeconds = Math.floor(gameLengthMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours} hours ${minutes} minutes ${seconds} seconds`;
  }
}
