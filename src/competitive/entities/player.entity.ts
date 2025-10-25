import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from 'src/account/entities/account.entity';
import { Team } from './team.entity';
import { Match } from './match.entity';
import { NumericTransformer } from 'src/transformers/numeric';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.id, {
    onDelete: 'CASCADE',
  })
  account: Account;

  @ManyToOne(() => Team, (team) => team.id, {
    onDelete: 'CASCADE',
  })
  team: Team;

  @Column('uuid')
  partyId: string;

  @Column('uuid')
  characterId: string;

  @Column('int', { nullable: true })
  customScore: number;

  @Column('int', { nullable: true })
  damageDelta: number;
  @Column('int', { nullable: true })
  kast: number;
  @Column({
    type: 'numeric',
    precision: 7,
    scale: 3,
    transformer: new NumericTransformer(),
  })
  adr: number;
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 3,
    transformer: new NumericTransformer(),
  })
  kdRatio: number;
  @Column({
    type: 'numeric',
    precision: 6,
    scale: 3,
    nullable: true,
    transformer: new NumericTransformer(),
  })
  headshotPercentage: number;
  @Column({
    type: 'numeric',
    precision: 7,
    scale: 3,
    nullable: true,
    transformer: new NumericTransformer(),
  })
  economyRating: number;

  @Column('int', { nullable: true })
  firstBloods: number;
  @Column('int', { nullable: true })
  firstDeaths: number;

  // [3k, 4k, 5k, ..., nk] Current max is 7k, but no hard limit in code
  @Column('simple-array', { nullable: true })
  multiKills: number[];

  @Column('int', { nullable: true })
  plants: number;
  @Column('int', { nullable: true })
  defuses: number;

  @Column('int')
  score: number;
  @Column({
    type: 'numeric',
    precision: 7,
    scale: 3,
    transformer: new NumericTransformer(),
  })
  averageCombatScore: number;
  @Column('int')
  roundsPlayed: number;
  @Column('int')
  kills: number;
  @Column('int')
  deaths: number;
  @Column('int')
  assists: number;
  @Column('int')
  grenadeCasts: number;
  @Column('int')
  ability1Casts: number;
  @Column('int')
  ability2Casts: number;
  @Column('int')
  ultimateCasts: number;

  @Column('int')
  rank: number;

  @ManyToOne(() => Match, (match) => match.players, {
    onDelete: 'CASCADE',
  })
  match: Match;
}
