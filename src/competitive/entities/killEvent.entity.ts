import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { KillPlayerLocation } from './killPlayerLocation.entity';
import { Round } from './round.entity';

@Entity()
export class KillEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamptz')
  globalTime: Date;
  @Column('interval')
  gameTime: string;
  @Column('interval')
  roundTime: string;

  @ManyToOne(() => Player, {
    orphanedRowAction: 'delete',
  })
  actor: Player;

  @Column('simple-array')
  actorLocation: number[];

  @ManyToOne(() => Player, { nullable: true, orphanedRowAction: 'delete' })
  target: Player;

  @Column('simple-array', { nullable: true })
  targetLocation: number[];

  @ManyToMany(() => Player)
  @JoinTable()
  assistants: Player[];

  @OneToMany(() => KillPlayerLocation, (location) => location.killEvent)
  playerLocations: KillPlayerLocation[];

  @Column()
  damageType: string;
  @Column()
  damageItem: string;
  @Column('boolean')
  isSecondaryFireMode: boolean;

  @ManyToOne(() => Round, (round) => round.killEvents, {
    orphanedRowAction: 'delete',
  })
  round: Round;
}
