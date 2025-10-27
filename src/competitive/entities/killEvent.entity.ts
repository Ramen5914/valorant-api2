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
    onDelete: 'CASCADE',
  })
  actor: Player;

  @Column('simple-array')
  actorLocation: number[];

  @ManyToOne(() => Player, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  target: Player;

  @Column('simple-array', { nullable: true })
  targetLocation: number[];

  @ManyToMany(() => Player)
  @JoinTable()
  assistants: Player[];

  @OneToMany(() => KillPlayerLocation, (location) => location.killEvent, {
    cascade: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  playerLocations: KillPlayerLocation[];

  @Column()
  damageType: string;
  @Column()
  damageItem: string;
  @Column('boolean')
  isSecondaryFireMode: boolean;

  @ManyToOne(() => Round, (round) => round.killEvents, {
    onDelete: 'CASCADE',
  })
  round: Round;
}
