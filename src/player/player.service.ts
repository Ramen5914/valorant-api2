import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { Repository } from 'typeorm';
import { ExternalService } from 'src/external/external.service';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    private readonly externalService: ExternalService,
  ) {}

  async createPlayerWithApi(name: string, tag: string): Promise<Player> {
    const account = (await this.externalService.getAccountByName(name, tag))
      .data;

    const newPlayer = this.playerRepository.create({
      id: account.puuid,
      name: account.name,
      tag: account.tag,
      playerCard: account.card,
      title: account.title,
      accountLevel: account.account_level,
      region: account.region,
    });

    return this.playerRepository.save(newPlayer);
  }

  async createPlayer(
    id: string,
    name: string,
    tag: string,
    playerCard: string,
    title: string,
    accountLevel: number,
    region: string,
  ): Promise<Player> {
    return this.playerRepository.save({
      id,
      name,
      tag,
      playerCard,
      title,
      accountLevel,
      region,
    });
  }

  async getPlayerById(id: string): Promise<Player | null> {
    return this.playerRepository.findOne({ where: { id } });
  }

  async getAllPlayers(): Promise<Player[]> {
    return this.playerRepository.find();
  }
}
