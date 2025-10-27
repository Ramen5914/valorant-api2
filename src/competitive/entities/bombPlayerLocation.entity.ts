import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { BombEvent } from './bombEvent.entity';

@Entity()
export class BombPlayerLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, (player) => player.id, {
    onDelete: 'CASCADE',
  })
  player: Player;

  @Column('float')
  viewRadians: number;
  @Column('simple-array')
  location: number[];

  @ManyToOne(() => BombEvent, (bombEvent) => bombEvent.playerLocations, {
    onDelete: 'CASCADE',
  })
  bombEvent: BombEvent;
}
