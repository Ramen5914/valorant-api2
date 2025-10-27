import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { Player } from './player.entity';
import { Round } from './round.entity';

@Entity()
export class Match {
  @PrimaryColumn('uuid', { nullable: false })
  id: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid')
  map: string;

  @Column()
  gamePodId: string;

  @Column()
  gameLoopZone: string;

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

  @OneToMany(() => Player, (player) => player.match, {
    cascade: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  players: Player[];

  @OneToMany(() => Team, (team) => team.match, {
    cascade: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  teams: Team[];

  @OneToMany(() => Round, (round) => round.match, {
    cascade: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  rounds: Round[];
}
