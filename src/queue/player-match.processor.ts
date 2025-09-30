import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Job } from 'bull';
import { PlayerMatchJobData } from './player-match-queue.service';
import { CompetitiveService } from '../competitive/competitive.service';
import { CompetitiveSchema as CompetitiveSchema } from '../competitive/competitive.schema';
import { ExternalService } from 'src/external/external.service';

@Processor('player-matches')
@Injectable()
export class PlayerMatchProcessor {
  constructor(
    private readonly competitiveService: CompetitiveService,
    private readonly externalService: ExternalService,
  ) {}

  @Process('fetch-player-matches')
  async handlePlayerMatches(job: Job<PlayerMatchJobData>) {
    const { playerId, region } = job.data;

    try {
      console.log(`Processing matches for player: ${playerId}`);

      // Fetch match IDs from Valorant API
      const matchIds = await this.fetchPlayerMatches(playerId, region);

      if (!matchIds || matchIds.length === 0) {
        console.log(`No matches found for player: ${playerId}`);
        return;
      }

      // Process and store each match
      for (const matchId of matchIds) {
        await this.processAndStoreMatch(matchId, region);
        // Add delay between match processing to avoid rate limiting
        await this.delay(500); // 500ms delay between match fetches
      }

      console.log(
        `Successfully processed ${matchIds.length} matches for ${playerId}`,
      );
    } catch (error) {
      console.error(
        `Failed to process matches for ${playerId}:`,
        (error as Error).message,
      );
      throw error; // This will mark the job as failed and trigger retries
    }
  }

  private async fetchPlayerMatches(
    puuid: string,
    region: string,
  ): Promise<string[]> {
    console.log(`Fetching matches for ${puuid} in region: ${region}`);

    // Use Henrik's raw endpoint with matchhistory type for PUUID
    const matchListResponse = await this.externalService.getMatchesByPuuid(
      puuid,
      region,
    );

    // All matches should already be competitive due to the query filter
    const competitiveMatches = matchListResponse.filter(
      (match) => match.metadata.queue.mode_type === 'competitive',
    );

    console.log(`Competitive matches found: ${competitiveMatches.length}`);

    return competitiveMatches.map((match) => match.metadata.match_id);
  }

  private async processAndStoreMatch(
    matchId: string,
    region: string,
  ): Promise<void> {
    const matchData: CompetitiveSchema =
      await this.externalService.getMatchById(matchId, region);

    await this.competitiveService.createMatch(matchData);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
