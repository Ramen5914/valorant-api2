import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Match } from './match.entity';
import { Player } from './player.entity';

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

  @Column('int')
  averageRank: number;

  @OneToMany(() => Player, (player) => player.team, { cascade: true })
  players: Player[];

  @ManyToOne(() => Match, (match) => match.teams, {
    orphanedRowAction: 'delete',
  })
  match: Match;
}
