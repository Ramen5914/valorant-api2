import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AccountV2, MapsResponse, MatchlistV4 } from './external.schema';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { CompetitiveSchema } from 'src/competitive/competitive.schema';

@Injectable()
export class ExternalService implements OnModuleInit {
  private maps: Record<string, string>;

  private axiosConfig: AxiosRequestConfig = {
    headers: {
      Authorization: process.env.HENRIK_API_KEY,
    },
  };

  constructor(private readonly httpService: HttpService) {}

  async getMatchesByPuuid(puuid: string, region: string): Promise<MatchlistV4> {
    const res = await firstValueFrom(
      this.httpService.get(
        `https://api.henrikdev.xyz/valorant/v4/by-puuid/matches/${region}/pc/${puuid}`,
        this.axiosConfig,
      ),
    );

    return MatchlistV4.parse(res.data);
  }

  async getAccountByName(name: string, tag: string): Promise<AccountV2> {
    const res = await firstValueFrom(
      this.httpService.get(
        `https://api.henrikdev.xyz/valorant/v2/account/${name}/${tag}`,
        this.axiosConfig,
      ),
    );

    return AccountV2.parse(res.data);
  }

  async getMatchById(id: string, region: string): Promise<CompetitiveSchema> {
    const config = this.axiosConfig;
    config.data = {
      type: 'matchdetails',
      value: id,
      region: region,
    };

    const res = await firstValueFrom(
      this.httpService.post<{ data: any }>(
        'https://api.henrikdev.xyz/valorant/v1/raw',
        this.axiosConfig,
      ),
    );

    return CompetitiveSchema.parse(res.data.data);
  }

  @Cron('0 0 * * *')
  async refresh() {
    await this.updateMaps();
  }

  async updateMaps() {
    const res = await firstValueFrom(
      this.httpService.get('https://valorant-api.com/v1/maps'),
    );

    const maps = MapsResponse.parse(res.data);

    const mapsRecord: Record<string, string> = {};
    for (const map of maps.data) {
      if (map.mapUrl && map.uuid) {
        mapsRecord[map.mapUrl] = map.uuid;
      }
    }

    this.maps = mapsRecord;
  }

  getMaps(): Record<string, string> {
    return this.maps;
  }

  async onModuleInit() {
    await this.refresh();
  }
}
