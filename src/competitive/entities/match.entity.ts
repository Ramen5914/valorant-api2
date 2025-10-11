import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Team } from './team.entity';
import { Player } from './player.entity';
import { Round } from './round.entity';

@Entity()
export class Match {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  map: string;

  @Column({ length: 64 })
  gameVersion: string;

  @Column('interval')
  duration: string;

  @Column('timestamptz')
  startTime: Date;

  @Column('boolean')
  completedEarly: boolean;

  @Column('uuid')
  season: string;

  @Column('int')
  averageRank: number;

  @OneToMany(() => Player, (player) => player.match, {
    cascade: true,
  })
  players: Player[];

  @OneToMany(() => Team, (team) => team.match, { cascade: true })
  teams: Team[];

  @OneToMany(() => Round, (round) => round.match, {
    cascade: true,
  })
  rounds: Round[];
}
