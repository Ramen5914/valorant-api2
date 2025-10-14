import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { BombEvent } from './bombEvent.entity';

@Entity()
export class BombPlayerLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, (player) => player.id, {
    orphanedRowAction: 'delete',
  })
  player: Player;

  @Column('float')
  viewRadians: number;
  @Column('simple-array')
  location: number[];

  @ManyToOne(() => BombEvent, (bombEvent) => bombEvent.playerLocations, {
    orphanedRowAction: 'delete',
  })
  bombEvent: BombEvent;
}
