import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Match } from './match.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  teamId: string;

  @Column('boolean')
  won: boolean;

  @Column('int')
  roundsPlayed: number;

  @Column('int')
  roundsWon: number;

  @Column('int')
  points: number;

  @ManyToOne(() => Match, (match) => match.teams)
  match: Match;
}
