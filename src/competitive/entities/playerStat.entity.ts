import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from 'src/player/entities/player.entity';
import { CompetitiveMatch } from './competitive.entity';
import { Team } from './team.entity';

@Entity('competitive_player')
export class CompetitivePlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, (player) => player.id)
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @Index()
  @Column('uuid')
  playerId: string;

  @Column('uuid')
  partyId: string;

  @Column('uuid')
  characterId: string;

  @Column('int')
  score: number;
  @Column('int')
  roundsPlayed: number;

  @Column('int')
  kills: number;
  @Column('int')
  deaths: number;
  @Column('int')
  assists: number;

  @Column('int')
  grenadeCasts: number;
  @Column('int')
  ability1Casts: number;
  @Column('int')
  ability2Casts: number;
  @Column('int')
  ultimateCasts: number;

  @Column('int')
  competitiveTier: number;

  @ManyToOne(() => CompetitiveMatch, (competitiveMatch) => competitiveMatch.id)
  @JoinColumn({ name: 'matchId' })
  match: CompetitiveMatch;

  @ManyToOne(() => Team, (team) => team.id)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Index()
  @Column('uuid')
  matchId: string;
}
