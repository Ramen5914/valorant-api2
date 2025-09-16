import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Competitive } from './competitive.entity';

@Entity()
export class PlayerStat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Competitive, (competitive) => competitive.playerStats)
  matchId: Competitive;
}
