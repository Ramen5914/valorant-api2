import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { BombEvent } from './bombEvent.entity';

@Entity()
export class BombPlayerLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, (player) => player.id)
  player: Player;

  @Column('float')
  viewRadians: number;
  @Column('simple-array')
  location: number[];

  @ManyToOne(() => BombEvent, (bombEvent) => bombEvent.playerLocations)
  bombEvent: BombEvent;
}
