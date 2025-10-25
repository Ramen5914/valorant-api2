import { Player } from 'src/competitive/entities/player.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Account {
  @PrimaryColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @Column('timestamptz')
  lastMatch: Date;

  @Column()
  name: string;
  @Column()
  tag: string;

  @Column('boolean', { default: false })
  isPublic: boolean;

  @Column('uuid')
  playerCard: string;
  @Column('uuid')
  title: string;
  @Column('uuid', { nullable: true, default: null })
  preferredLevelBorder: string | null;
  @Column('int')
  accountLevel: number;

  @Column('uuid', { nullable: true, default: null })
  rosterId: string | null;
  @Column('boolean', { nullable: true, default: null })
  showTag: boolean | null;
  @Column('boolean', { nullable: true, default: null })
  showPlating: boolean | null;

  @Column({ length: 8 })
  region: string;

  @OneToMany(() => Player, (player) => player.account)
  matchStats: Player[];
}
