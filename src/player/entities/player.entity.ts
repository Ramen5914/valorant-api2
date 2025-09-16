import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Player {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;
  @Column()
  tag: string;

  @Column('uuid')
  playerCard: string;
  @Column('uuid')
  title: string;
  @Column('uuid')
  preferredLevelBorder: string;
  @Column('int')
  accountLevel: number;

  @Column('uuid', { nullable: true })
  premierTeam: string | null;

  @Column({ length: 8 })
  region: string;
}
