import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Competitive } from './competitive.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teamId: string;

  @Column('boolean')
  won: boolean;

  @Column('int')
  roundsPlayed: number;

  @Column('int')
  roundsWon: number;

  @Column('int')
  points: number;

  @ManyToOne(() => Competitive, (competitive) => competitive.teams)
  @JoinColumn({ name: 'matchId' })
  match: Competitive;

  @Index()
  @Column('uuid')
  matchId: string;
}
