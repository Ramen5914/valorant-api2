import { Inject, Injectable } from '@nestjs/common';
import { CompetitiveSchema } from './competitive.schema';
import { Match } from './entities/match.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalService } from 'src/external/external.service';
import { millisToDuration } from 'src/functions/time';
import { Team } from './entities/team.entity';
import { Player } from './entities/player.entity';
import { AccountService } from 'src/account/account.service';
import { Round } from './entities/round.entity';
import { BombEvent, BombEventType } from './entities/bombEvent.entity';

@Injectable()
export class CompetitiveService {
  constructor(
    @InjectRepository(Match)
    private competitiveRepository: Repository<Match>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(Round)
    private roundRepository: Repository<Round>,
    @InjectRepository(BombEvent)
    private bombEventRepository: Repository<BombEvent>,
    @Inject()
    private externalService: ExternalService,
    @Inject()
    private accountService: AccountService,
  ) {}

  async createMatch(match: CompetitiveSchema): Promise<Match> {
    const regionRegex = new RegExp(/aresriot\.aws-.+?-prod\.(.+?)-gp-.+?-\d+/);

    const region: string | undefined =
      match.matchInfo.gamePodId.match(regionRegex)?.[1];

    if (!region) {
      throw new Error('Could not determine region from gamePodId');
    }

    const matchStart = new Date(match.matchInfo.gameStartMillis);

    const compMatch = this.competitiveRepository.create({
      id: match.matchInfo.matchId,
      gamePodId: match.matchInfo.gamePodId,
      gameLoopZone: match.matchInfo.gameLoopZone,
      gameVersion: match.matchInfo.gameVersion,
      map: this.externalService.getMaps()[match.matchInfo.mapId],
      startTime: matchStart,
      duration: millisToDuration(match.matchInfo.gameLengthMillis),
      completedEarly: match.matchInfo.isEarlyCompletion,
      season: match.matchInfo.seasonId,
    });

    const cumulativeRoundStats: Record<
      string, // Player ID / Subject (UUID)
      {
        dd: number;
        kast: number;
        hsp: number;
        eco: number;
        fb: number;
        fd: number;
        mks: number[];
        plants: number;
        defuses: number;
      }
    > = {};
    const rounds: Round[] = match.roundResults.map((round) => {
      let kill: (typeof round.playerStats)[number]['kills'][number] | undefined;
      for (const playerStat of round.playerStats) {
        if (playerStat.kills.length > 0) {
          kill = playerStat.kills[0];
          break;
        }
      }

      if (!kill) {
        throw new Error('No kills found in round data');
      }

      const roundGlobalTime =
        compMatch.startTime.getTime() + kill.gameTime - kill.roundTime;
      const roundGameTime = kill.gameTime - kill.roundTime;

      const bombEvents: BombEvent[] = [];
      if (round.plantRoundTime != 0 && round.plantPlayerLocations) {
        const plantEvent = this.bombEventRepository.create({
          type: BombEventType.PLANT,
          globalTime: new Date(round.plantRoundTime + roundGlobalTime),
          gameTime: millisToDuration(round.plantRoundTime + roundGameTime),
          roundTime: millisToDuration(round.plantRoundTime),
          actorLocation: [round.plantLocation.x, round.plantLocation.y],
        });

        bombEvents.push(plantEvent);
      }

      if (round.defuseRoundTime != 0 && round.defusePlayerLocations) {
        const defuseEvent = this.bombEventRepository.create({
          type: BombEventType.DEFUSE,
          globalTime: new Date(round.defuseRoundTime + roundGlobalTime),
          gameTime: millisToDuration(round.defuseRoundTime + roundGameTime),
          roundTime: millisToDuration(round.defuseRoundTime),
          actorLocation: [round.defuseLocation.x, round.defuseLocation.y],
        });

        bombEvents.push(defuseEvent);
      }

      return this.roundRepository.create({
        roundNumber: round.roundNum + 1,
        globalTime: new Date(roundGlobalTime),
        gameTime: millisToDuration(roundGameTime),
        roundResult: round.roundResult,
        roundCeremony: round.roundCeremony,
        roundResultCode: round.roundResultCode,
        winningTeamId: round.winningTeam,
        bombEvents: bombEvents,
      });
    });

    const teams: Promise<Team>[] = match.teams.map(async (team) => {
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
        players: await Promise.all(
          tPlayers.map(async (player) => {
            let playerStats = cumulativeRoundStats[player.subject];

            if (!playerStats) {
              // throw new Error('Player stats not initialized');
              playerStats = {
                dd: 0,
                kast: 0,
                hsp: 0,
                eco: 0,
                fb: 0,
                fd: 0,
                mks: [],
                plants: 0,
                defuses: 0,
              };
            }

            return this.playerRepository.create({
              ability1Casts: player.stats.abilityCasts.ability1Casts,
              ability2Casts: player.stats.abilityCasts.ability2Casts,
              account: await this.accountService.updatePlayer(
                {
                  id: player.subject,
                  name: player.gameName,
                  tag: player.tagLine,
                  playerCard: player.playerCard,
                  title: player.playerTitle,
                  accountLevel: player.accountLevel,
                  levelBorder: player.preferredLevelBorder ?? undefined,
                  region: region,
                  premier: {
                    rosterId: player.premierPrestige.rosterID ?? undefined,
                    showTag: player.premierPrestige.showTag ?? undefined,
                    showPlating:
                      player.premierPrestige.showPlating ?? undefined,
                  },
                },
                matchStart,
              ),
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
              averageCombatScore:
                player.stats.score / Math.max(1, team.roundsPlayed),
              characterId: player.characterId,
              customScore: undefined, // TODO create a custom scoring metric similar to Tracker Score for tracker network
              damageDelta: playerStats.dd, // TODO calculate all damage stats for all players in one for loop
              deaths: player.stats.deaths,
              defuses: playerStats.defuses, // TODO calculate times a player defused
              economyRating: playerStats.eco, // TODO calculate economy rating
              firstBloods: playerStats.fb, // TODO calculate first bloods
              firstDeaths: playerStats.fd, // TODO calculate first deaths
              grenadeCasts: player.stats.abilityCasts.grenadeCasts,
              headshotPercentage: playerStats.hsp, // TODO calculate headshot percentage
              kast: playerStats.kast, // TODO calculate KAST
              kdRatio:
                player.stats.kills /
                (player.stats.deaths === 0 ? 1 : player.stats.deaths),
              kills: player.stats.kills,
              match: compMatch,
              multiKills: playerStats.mks, // TODO calculate multi kills
              partyId: player.partyId,
              plants: playerStats.plants, // TODO calculate times a player planted
              rank: player.competitiveTier,
              roundsPlayed: player.stats.roundsPlayed,
              score: player.stats.score,
              ultimateCasts: player.stats.abilityCasts.ultimateCasts,
            });
          }),
        ),
      });
    });

    compMatch.rounds = rounds;
    compMatch.teams = await Promise.all(teams);

    return await this.competitiveRepository.save(compMatch);
  }

  async getMatchById(id: string): Promise<Match | null> {
    return this.competitiveRepository.findOne({
      where: { id },
      relations: [
        'teams',
        'players',
        'players.account',
        'rounds',
        'rounds.bombEvents',
      ],
    });
  }
}
