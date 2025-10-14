import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PlayerRoundStat {
  @PrimaryGeneratedColumn()
  id: number;
}
