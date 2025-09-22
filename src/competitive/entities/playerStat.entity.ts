import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from 'src/player/entities/player.entity';
import { Competitive } from './competitive.entity';

@Entity()
export class PlayerStat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player)
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

  @ManyToOne(() => Competitive)
  @JoinColumn({ name: 'matchId' })
  match: Competitive;

  @Index()
  @Column('uuid')
  matchId: string;
}
