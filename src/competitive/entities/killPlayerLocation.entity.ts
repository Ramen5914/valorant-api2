import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { KillEvent } from './killEvent.entity';

@Entity()
export class KillPlayerLocation {
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

  @ManyToOne(() => KillEvent, (killEvent) => killEvent.playerLocations, {
    onDelete: 'CASCADE',
  })
  killEvent: KillEvent;
}
