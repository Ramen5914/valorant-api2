import { Column, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';
import { PlayerStat } from './playerStat.entity';

@Entity()
export class Competitive {
  @PrimaryColumn('uuid')
  id: string;

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

  @OneToMany(() => PlayerStat, (playerStat) => playerStat.matchId)
  playerStats: PlayerStat[];
}
