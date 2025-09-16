import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { Job } from 'bull';
import { firstValueFrom } from 'rxjs';
import { Competitive } from '../competitive/entities/competitive.entity';
import { PlayerMatchJobData } from './player-match-queue.service';

interface HenrikMatchListResponse {
  data: {
    matchid: string;
    map: {
      id: string;
      name: string;
    };
    started_at: string;
    is_ranked: boolean;
  }[];
}

interface HenrikMatchDetails {
  data: {
    metadata: {
      matchid: string;
      map: {
        id: string;
        name: string;
      };
      started_at: string;
      is_ranked: boolean;
      season_id: string;
      rounds_played: number;
    };
    rounds: Array<{
      winning_team: string;
    }>;
    players: {
      red: Array<{
        puuid: string;
        name: string;
        tag: string;
      }>;
      blue: Array<{
        puuid: string;
        name: string;
        tag: string;
      }>;
    };
  };
}

@Processor('player-matches')
@Injectable()
export class PlayerMatchProcessor {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Competitive)
    private competitiveMatchRepository: Repository<Competitive>,
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
      );

      if (!matchIds || matchIds.length === 0) {
        console.log(`No matches found for player: ${playerName}#${playerTag}`);
        return;
      }

      // Process and store each match
      for (const matchId of matchIds) {
        await this.processAndStoreMatch(matchId, region, playerId);
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
  ): Promise<string[]> {
    try {
      const apiKey = this.configService.get<string>('HENRIK_API_KEY');
      if (!apiKey) {
        throw new Error('HENRIK_API_KEY not configured');
      }

      // First, get the player's PUUID using their name and tag
      const accountResponse = await firstValueFrom(
        this.httpService.get<{ data: { puuid: string } }>(
          `https://api.henrikdev.xyz/valorant/v2/account/${name}/${tag}`,
          {
            headers: {
              Authorization: apiKey,
            },
          },
        ),
      );

      if (!accountResponse.data?.data?.puuid) {
        console.log(`Could not find PUUID for player ${name}#${tag}`);
        return [];
      }

      const puuid = accountResponse.data.data.puuid;

      // Now fetch the match list using the PUUID
      const matchListResponse = await firstValueFrom(
        this.httpService.get<HenrikMatchListResponse>(
          `https://api.henrikdev.xyz/valorant/v4/by-puuid/matches/${region}/pc/${puuid}`,
          {
            headers: {
              Authorization: apiKey,
            },
          },
        ),
      );

      if (
        !matchListResponse.data?.data ||
        !Array.isArray(matchListResponse.data.data)
      ) {
        return [];
      }

      // Filter for ranked matches only and return match IDs
      return matchListResponse.data.data
        .filter((match) => match.is_ranked)
        .map((match) => match.matchid);
    } catch (error) {
      console.error(
        `Failed to fetch matches from API:`,
        (error as Error).message,
      );
      return [];
    }
  }

  private async processAndStoreMatch(
    matchId: string,
    region: string,
    playerId: string,
  ): Promise<void> {
    try {
      // Check if match already exists
      const existingMatch = await this.competitiveMatchRepository.findOne({
        where: { id: matchId },
      });

      if (existingMatch) {
        console.log(`Match ${matchId} already exists, skipping`);
        return;
      }

      // Fetch full match details
      const matchDetails = await this.fetchMatchDetails(matchId, region);
      if (!matchDetails) {
        console.log(`Could not fetch details for match ${matchId}`);
        return;
      }

      // Create new competitive match record
      const competitiveMatch = new Competitive();
      competitiveMatch.id = matchDetails.data.metadata.matchid;
      competitiveMatch.version = '1.0'; // You may want to get this from the API
      competitiveMatch.mapId = matchDetails.data.metadata.map.id;
      competitiveMatch.duration = this.calculateMatchDuration(
        matchDetails.data.rounds.length,
      );
      competitiveMatch.startTime = new Date(
        matchDetails.data.metadata.started_at,
      );
      competitiveMatch.isEarlyCompletion =
        matchDetails.data.metadata.rounds_played < 24; // Standard competitive is best of 25 rounds
      competitiveMatch.seasonId = matchDetails.data.metadata.season_id;

      await this.competitiveMatchRepository.save(competitiveMatch);
      console.log(`Stored match ${matchId}`);
    } catch (error) {
      console.error(
        `Failed to store match ${matchId}:`,
        (error as Error).message,
      );
      // Don't throw here - we want to continue processing other matches
    }
  }

  private async fetchMatchDetails(
    matchId: string,
    region: string,
  ): Promise<HenrikMatchDetails | null> {
    try {
      const apiKey = this.configService.get<string>('HENRIK_API_KEY');
      if (!apiKey) {
        throw new Error('HENRIK_API_KEY not configured');
      }

      const response = await firstValueFrom(
        this.httpService.get<HenrikMatchDetails>(
          `https://api.henrikdev.xyz/valorant/v4/match/${region}/${matchId}`,
          {
            headers: {
              Authorization: apiKey,
            },
          },
        ),
      );

      return response.data;
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

  private convertGameLengthToInterval(gameLengthMs: number): string {
    const totalSeconds = Math.floor(gameLengthMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours} hours ${minutes} minutes ${seconds} seconds`;
  }
}
