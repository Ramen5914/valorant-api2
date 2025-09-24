import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { PlayerStat } from './playerStat.entity';

@Entity()
export class Competitive {
  @PrimaryColumn('uuid')
  id: string;

  @CreateDateColumn()
  createAt: Date;

  @Column({ length: 64 })
  version: string;

  @Column('uuid')
  mapId: string;

  @Column('timestamptz')
  startTime: Date;

  @Column('interval')
  duration: string;

  @Column('boolean')
  isEarlyCompletion: boolean;

  @Index()
  @Column('uuid')
  seasonId: string;

  @OneToMany(() => Team, (team) => team.match, {
    cascade: true,
    eager: true,
  })
  teams: Team[];

  @OneToMany(() => PlayerStat, (playerStat) => playerStat.match, {
    cascade: true,
  })
  playerStats: PlayerStat[];
}
