import { Inject, Injectable } from '@nestjs/common';
import { CompetitiveSchema as CompetitiveSchema } from './competitive.schema';
import { Competitive } from './entities/competitive.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerStat } from './entities/playerStat.entity';
import { ExternalService } from '../external/external.service';
import { Player } from 'src/player/entities/player.entity';

@Injectable()
export class CompetitiveService {
  constructor(
    @InjectRepository(Competitive)
    private competitiveRepository: Repository<Competitive>,
    @InjectRepository(PlayerStat)
    private playerStatRepository: Repository<PlayerStat>,
    @Inject()
    private externalService: ExternalService,
  ) {}

  async createMatch(match: CompetitiveSchema): Promise<Competitive> {
    const existingMatch = await this.competitiveRepository.findOne({
      where: { id: match.matchInfo.matchId },
    });

    if (existingMatch) {
      return existingMatch;
    }

    const mapUuid = this.externalService.getMaps()[match.matchInfo.mapId];

    if (!mapUuid) {
      throw new Error(`Unknown map: ${match.matchInfo.mapId}`);
    }

    const competitiveMatch = this.competitiveRepository.create({
      id: match.matchInfo.matchId,
      version: match.matchInfo.gameVersion,
      mapId: mapUuid,
      startTime: new Date(match.matchInfo.gameStartMillis),
      duration: match.matchInfo.gameLengthMillis.toString(),
      isEarlyCompletion: match.matchInfo.isCompleted,
      seasonId: match.matchInfo.seasonId,
      teams: match.teams.map((teamData) => ({
        teamId: teamData.teamId,
        won: teamData.won,
        roundsPlayed: teamData.roundsPlayed,
        roundsWon: teamData.roundsWon,
        points: teamData.numPoints,
      })),
      playerStats: match.players.map((playerData) => ({
        playerId: playerData.subject,
        partyId: playerData.partyId,
        characterId: playerData.characterId,
        score: playerData.stats.score,
        roundsPlayed: playerData.stats.roundsPlayed,
        kills: playerData.stats.kills,
        deaths: playerData.stats.deaths,
        assists: playerData.stats.assists,
        grenadeCasts: playerData.stats.abilityCasts.grenadeCasts,
        ability1Casts: playerData.stats.abilityCasts.ability1Casts,
        ability2Casts: playerData.stats.abilityCasts.ability2Casts,
        ultimateCasts: playerData.stats.abilityCasts.ultimateCasts,
        competitiveTier: playerData.competitiveTier,
        matchId: match.matchInfo.matchId,
      })),
    });

    return await this.competitiveRepository.save(competitiveMatch);
  }

  async findMatchesByPlayerId(playerId: string): Promise<PlayerStat[]> {
    const playerMatches = await this.playerStatRepository.find({
      where: { playerId: playerId },
      relations: ['match'],
      order: { match: { startTime: 'DESC' } },
    });

    return playerMatches;
  }
}
