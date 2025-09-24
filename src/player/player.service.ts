import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Player } from './entities/player.entity';
import { Repository } from 'typeorm';

type ApiAccount = {
  status: 200;
  data: {
    puuid: string;
    region: string;
    account_level: number;
    name: string;
    tag: string;
    card: string;
    title: string;
    platoforms: string[];
    updated_at: string;
  };
};

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async createPlayerWithApi(name: string, tag: string): Promise<Player> {
    const res = await firstValueFrom(
      this.httpService.get<ApiAccount>(
        `https://api.henrikdev.xyz/valorant/v2/account/${name}/${tag}`,
        {
          headers: {
            Authorization: this.configService.get<string>('HENRIK_API_KEY'),
            Accept: 'application/json',
          },
        },
      ),
    );

    const playerData = res.data.data;

    const newPlayer = this.playerRepository.create({
      id: playerData.puuid,
      name: playerData.name,
      tag: playerData.tag,
      playerCard: playerData.card,
      title: playerData.title,
      accountLevel: playerData.account_level,
      region: playerData.region,
    });

    return this.playerRepository.save(newPlayer);
  }
}
