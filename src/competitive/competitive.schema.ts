import { z } from 'zod';

export const CompetitiveSchema = z.object({
  matchInfo: z.object({
    matchId: z.guid(),
    mapId: z.string(),
    gameVersion: z.string(),
    gameLengthMillis: z.int(),
    gameStartMillis: z.int(),
    isCompleted: z.literal(true),
    isEarlyCompletion: z.boolean(),
    queueID: z.literal('competitive'),
    isRanked: z.literal(true),
    seasonId: z.guid(),
    completionState: z.literal('Completed'),
    platformType: z.literal('pc'),
    isReplayRecorded: z.boolean(),
  }),
  players: z.array(
    z.object({
      subject: z.guid(),
      gameName: z.string(),
      tagLine: z.string(),
      teamId: z.string(),
      partyId: z.guid(),
      characterId: z.guid(),
      stats: z.object({
        score: z.int(),
        roundsPlayed: z.int(),
        kills: z.int(),
        deaths: z.int(),
        assists: z.int(),
        abilityCasts: z.object({
          grenadeCasts: z.int(),
          ability1Casts: z.int(),
          ability2Casts: z.int(),
          ultimateCasts: z.int(),
        }),
      }),
      competitiveTier: z.int(),
      playerCard: z.guid(),
      playerTitle: z.guid(),
      preferredLevelBorder: z.guid().or(z.undefined()).or(z.null()),
      accountLevel: z.int(),
      premierPrestige: z
        .object({
          rosterID: z.guid(),
          rosterName: z.string(),
          rosterTag: z.string(),
          plating: z.string(),
          showTag: z.boolean(),
          showPlating: z.boolean(),
        })
        .or(z.object({})),
    }),
  ),
  teams: z.array(
    z.object({
      teamId: z.string(),
      won: z.boolean(),
      roundsPlayed: z.int(),
      roundsWon: z.int(),
      numPoints: z.int(),
    }),
  ),
  roundResults: z.array(
    z.object({
      roundNum: z.int(),
      roundResult: z.enum([
        'Eliminated',
        'Bomb defused',
        'Bomb detonated',
        'Round timer expired',
      ]),
      roundCeremony: z.enum([
        'CeremonyDefault',
        'CeremonyFlawless',
        'CeremonyClutch',
        'CeremonyCloser',
        'CeremonyThrifty',
        'CeremonyTeamAce',
        'CeremonyAce',
      ]),
      winningTeam: z.string(),
      plantRoundTime: z.int(),
      plantPlayerLocations: z
        .array(
          z.object({
            subject: z.guid(),
            viewRadians: z.number(),
            location: z.object({
              x: z.int(),
              y: z.int(),
            }),
          }),
        )
        .or(z.null()),
      plantLocation: z.object({
        x: z.int(),
        y: z.int(),
      }),
      plantSite: z.enum(['A', 'B', 'C', '']).or(z.null()),
      defuseRoundTime: z.int(),
      defusePlayerLocations: z
        .array(
          z.object({
            subject: z.guid(),
            viewRadians: z.number(),
            location: z.object({
              x: z.int(),
              y: z.int(),
            }),
          }),
        )
        .or(z.null()),
      defuseLocation: z.object({
        x: z.int(),
        y: z.int(),
      }),
      playerStats: z.array(
        z.object({
          subject: z.guid(),
          kills: z.array(
            z.object({
              gameTime: z.int(),
              roundTime: z.int(),
              killer: z.guid(),
              victim: z.guid(),
              victimLocation: z.object({
                x: z.int(),
                y: z.int(),
              }),
              assistants: z.array(z.guid()),
              playerLocations: z.array(
                z.object({
                  subject: z.guid(),
                  viewRadians: z.number(),
                  location: z.object({
                    x: z.int(),
                    y: z.int(),
                  }),
                }),
              ),
              finishingDamage: z.object({
                damageType: z.enum([
                  'Weapon',
                  'Ability',
                  'Bomb',
                  'Melee',
                  'Fall',
                ]),
                damageItem: z
                  .guid()
                  .or(
                    z.enum([
                      'Ultimate',
                      'Ability1',
                      'Ability2',
                      'GrenadeAbility',
                    ]),
                  )
                  .or(z.literal('')),
                isSecondaryFireMode: z.boolean(),
              }),
            }),
          ),
          damage: z.array(
            z.object({
              receiver: z.guid(),
              damage: z.int(),
              legshots: z.int(),
              bodyshots: z.int(),
              headshots: z.int(),
            }),
          ),
          score: z.int(),
          economy: z.object({
            loadoutValue: z.int(),
            weapon: z.guid().or(z.literal('')).or(z.null()),
            armor: z.guid().or(z.literal('')).or(z.null()),
            remaining: z.int(),
            spent: z.int(),
          }),
        }),
      ),
      roundResultCode: z.enum(['Elimination', 'Defuse', 'Detonate', '']),
    }),
  ),
});

export type CompetitiveSchema = z.infer<typeof CompetitiveSchema>;
