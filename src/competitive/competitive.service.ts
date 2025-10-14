import { Inject, Injectable } from '@nestjs/common';
import { CompetitiveSchema } from './competitive.schema';
import { Match } from './entities/match.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalService } from 'src/external/external.service';
import { millisToDuration } from 'src/functions/time';
import { Team } from './entities/team.entity';
import { Player } from './entities/player.entity';

@Injectable()
export class CompetitiveService {
  constructor(
    @InjectRepository(Match)
    private competitiveRepository: Repository<Match>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Player)
    private playerReposity: Repository<Player>,
    @Inject()
    private externalService: ExternalService,
  ) {}

  async createMatch(match: CompetitiveSchema): Promise<Match> {
    const compMatch = this.competitiveRepository.create({
      id: match.matchInfo.matchId,
      gameVersion: match.matchInfo.gameVersion,
      map: this.externalService.getMaps()[match.matchInfo.mapId],
      startTime: new Date(match.matchInfo.gameStartMillis),
      duration: millisToDuration(match.matchInfo.gameLengthMillis),
      completedEarly: match.matchInfo.isEarlyCompletion,
      season: match.matchInfo.seasonId,
      teams: match.teams.map((team) => {
        const tPlayers = match.players.filter(
          (player) => player.teamId == team.teamId,
        );

        return this.teamRepository.create({
          teamId: team.teamId,
          points: team.numPoints,
          roundsPlayed: team.roundsPlayed,
          roundsWon: team.roundsWon,
          won: team.won,
          averageRank: Math.round(
            tPlayers.reduce((sum, player) => sum + player.competitiveTier, 0) /
              tPlayers.length,
          ),
          players: tPlayers.map((player) => {
            return this.playerReposity.create({
              ability1Casts: player.stats.abilityCasts.ability1Casts,
              ability2Casts: player.stats.abilityCasts.ability2Casts,
              account: undefined, // TODO figure out how to link account to player (and update account when necessary)
              adr:
                (match.roundResults ?? []).reduce((sum, round) => {
                  const stats = round.playerStats.find(
                    (stat) => stat.subject === player.subject,
                  );
                  if (!stats) return sum;
                  const damageSum = stats.damage.reduce(
                    (acc, d) => acc + d.damage,
                    0,
                  );
                  return sum + damageSum;
                }, 0) / Math.max(1, team.roundsPlayed),
              assists: player.stats.assists,
              characterId: player.characterId,
              customScore: undefined, // TODO create a custom scoring metric similar to Tracker Score for tracker network
              damageDelta: undefined, // TODO calculate all damage stats for all players in one for loop
              deaths: player.stats.deaths,
              defuses: undefined, // TODO calculate times a player defused
              economyRating: undefined, // TODO calculate economy rating
              firstBloods: undefined, // TODO calculate first bloods
              firstDeaths: undefined, // TODO calculate first deaths
              grenadeCasts: player.stats.abilityCasts.grenadeCasts,
              headshotPercentage: undefined, // TODO calculate headshot percentage
              kast: undefined, // TODO calculate KAST
              kdRatio:
                player.stats.kills /
                (player.stats.deaths === 0 ? 1 : player.stats.deaths),
              kills: player.stats.kills,
              multiKills: undefined, // TODO calculate multi kills
              partyId: player.partyId,
              plants: undefined, // TODO calculate times a player planted
              rank: player.competitiveTier,
              roundsPlayed: player.stats.roundsPlayed,
              score: player.stats.score,
              ultimateCasts: player.stats.abilityCasts.ultimateCasts,
            });
          }),
        });
      }),
    });

    return await this.competitiveRepository.save(compMatch);
  }

  async getMatchById(id: string): Promise<Match | null> {
    return this.competitiveRepository.findOne({
      where: { id },
      relations: ['teams', 'teams.players'],
    });
  }
}
