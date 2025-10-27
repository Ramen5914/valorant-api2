import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { Round } from './round.entity';

@Entity()
export class DamageEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, {
    onDelete: 'CASCADE',
  })
  actor: Player;

  @ManyToOne(() => Player, {
    onDelete: 'CASCADE',
  })
  target: Player;

  @Column('int')
  damage: number;

  @Column('int')
  legshots: number;
  @Column('int')
  bodyshots: number;
  @Column('int')
  headshots: number;

  @ManyToOne(() => Round, (round) => round.damageEvents, {
    onDelete: 'CASCADE',
  })
  round: Round;
}
