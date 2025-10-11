import {
  // Inject,
  Injectable,
} from '@nestjs/common';
// import { CompetitiveSchema } from './competitive.schema';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ExternalService } from '../external/external.service';
// import { millisToDuration } from 'src/functions/time';
// import { Match } from './entities/match.entity';
// import { Player } from './entities/player.entity';

@Injectable()
export class CompetitiveService {
  // constructor(
  //   @InjectRepository(Match)
  //   private competitiveRepository: Repository<Match>,
  //   @InjectRepository(Player)
  //   private playerStatRepository: Repository<Player>,
  //   @Inject()
  //   private externalService: ExternalService,
  // ) {}
  // async createMatch(match: CompetitiveSchema): Promise<Match> {
  //   const existingMatch = await this.competitiveRepository.findOne({
  //     where: { id: match.matchInfo.matchId },
  //   });
  //   if (existingMatch) {
  //     return existingMatch;
  //   }
  //   const mapUuid = this.externalService.getMaps()[match.matchInfo.mapId];
  //   if (!mapUuid) {
  //     throw new Error(`Unknown map: ${match.matchInfo.mapId}`);
  //   }
  //   const competitiveMatch = this.competitiveRepository.create({
  //     id: match.matchInfo.matchId,
  //     version: match.matchInfo.gameVersion,
  //     mapId: mapUuid,
  //     startTime: new Date(match.matchInfo.gameStartMillis),
  //     duration: millisToDuration(match.matchInfo.gameLengthMillis),
  //     isEarlyCompletion: match.matchInfo.isEarlyCompletion,
  //     seasonId: match.matchInfo.seasonId,
  //     teams: match.teams.map((team) => ({
  //       teamId: team.teamId,
  //       won: team.won,
  //       roundsPlayed: team.roundsPlayed,
  //       roundsWon: team.roundsWon,
  //       points: team.numPoints,
  //       players: match.players
  //         .filter((player) => player.teamId === team.teamId)
  //         .map((player) => ({
  //           playerId: player.subject,
  //           partyId: player.partyId,
  //           characterId: player.characterId,
  //           score: player.stats.score,
  //           roundsPlayed: player.stats.roundsPlayed,
  //           kills: player.stats.kills,
  //           deaths: player.stats.deaths,
  //           assists: player.stats.assists,
  //           grenadeCasts: player.stats.abilityCasts.grenadeCasts,
  //           ability1Casts: player.stats.abilityCasts.ability1Casts,
  //           ability2Casts: player.stats.abilityCasts.ability2Casts,
  //           ultimateCasts: player.stats.abilityCasts.ultimateCasts,
  //           competitiveTier: player.competitiveTier,
  //         })),
  //     })),
  //   });
  //   const t = await this.competitiveRepository.save(competitiveMatch);
  //   console.log(t.teams[0]);
  //   return t;
  // }
  // async findMatchesByPlayerId(playerId: string): Promise<Player[]> {
  //   const playerMatches = await this.playerStatRepository.find({
  //     where: { playerId: playerId },
  //     relations: ['match'],
  //     order: { match: { startTime: 'DESC' } },
  //   });
  //   return playerMatches;
  // }
}
