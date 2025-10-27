import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { KillEvent } from './killEvent.entity';
import { DamageEvent } from './damageEvent.entity';
import { Match } from './match.entity';
import { BombEvent } from './bombEvent.entity';

@Entity()
export class Round {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  roundNumber: number;

  @Column('timestamptz')
  globalTime: Date;
  @Column('interval')
  gameTime: string;

  @Column()
  roundResult: string;
  @Column()
  roundCeremony: string;
  @Column()
  roundResultCode: string;

  @Column({ length: 4 })
  winningTeamId: string;

  @OneToMany(() => BombEvent, (event) => event.round, {
    cascade: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  bombEvents: BombEvent[];

  @OneToMany(() => KillEvent, (event) => event.round, {
    cascade: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  killEvents: KillEvent[];

  @OneToMany(() => DamageEvent, (event) => event.round, {
    cascade: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  damageEvents: DamageEvent[];

  @ManyToOne(() => Match, (match) => match.rounds, {
    onDelete: 'CASCADE',
  })
  match: Match;
}
