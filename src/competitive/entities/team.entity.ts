import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompetitiveMatch } from './competitive.entity';

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

  @ManyToOne(
    () => CompetitiveMatch,
    (competitiveMatch) => competitiveMatch.teams,
  )
  @JoinColumn({ name: 'matchId' })
  match: CompetitiveMatch;

  @Index()
  @Column('uuid')
  matchId: string;
}
