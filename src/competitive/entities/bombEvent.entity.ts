import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { Round } from './round.entity';
import { BombPlayerLocation } from './bombPlayerLocation.entity';

export enum BombEventType {
  PLANT,
  DEFUSE,
}

@Entity()
export class BombEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BombEventType })
  type: BombEventType;

  @Column('timestamptz')
  globalTime: Date;
  @Column('interval')
  gameTime: string;
  @Column('interval')
  roundTime: string;

  @ManyToOne(() => Player)
  actor: Player;

  @Column('simple-array')
  actorLocation: number[];

  @OneToMany(() => BombPlayerLocation, (location) => location.bombEvent)
  playerLocations: BombPlayerLocation[];

  @ManyToOne(() => Round, (round) => round.bombEvents)
  round: Round;
}
