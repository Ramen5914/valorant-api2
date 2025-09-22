import { PlayerStat } from 'src/competitive/entities/playerStat.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Player {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;
  @Column()
  tag: string;

  @Column('boolean', { default: false })
  isPublic: boolean;

  @Column('uuid', { nullable: true })
  playerCard: string | null;
  @Column('uuid', { nullable: true })
  title: string | null;
  @Column('uuid', { nullable: true })
  preferredLevelBorder: string | null;
  @Column('int')
  accountLevel: number;

  @Column('uuid', { nullable: true })
  rosterId: string | null;
  @Column('varchar', { nullable: true })
  rosterName: string | null;
  @Column('varchar', { nullable: true })
  rosterTag: string | null;
  @Column('varchar', { nullable: true })
  plating: string | null;
  @Column('boolean', { nullable: true })
  showTag: boolean | null;
  @Column('boolean', { nullable: true })
  showPlating: boolean | null;

  @Column({ length: 8 })
  region: string;

  @OneToMany(() => PlayerStat, (playerStat) => playerStat.player)
  matchStats: PlayerStat[];
}
