import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MapsResponse } from './external.schema';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalService implements OnModuleInit {
  private maps: Record<string, string>;

  constructor(private readonly httpService: HttpService) {}

  @Cron('0 0 * * *')
  async refresh() {
    await this.fetchMaps();
  }

  async fetchMaps() {
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
