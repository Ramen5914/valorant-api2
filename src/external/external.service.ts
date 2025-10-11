import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  AccountV2,
  CeremoniesResponse,
  MapsResponse,
  MatchlistV4,
} from './external.schema';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { CompetitiveSchema } from 'src/competitive/competitive.schema';

@Injectable()
export class ExternalService implements OnModuleInit {
  private maps: Record<string, string>;
  private ceremonies: Record<string, string>;

  // Store latest Henrik API rate limit headers
  private henrikRateLimit?: {
    remaining?: number;
    reset?: number;
    limit?: number;
  };
  /**
   * Returns the latest Henrik API rate limit info (if available) after any RAW call.
   * { remaining, reset, limit } or undefined if not available.
   */
  getHenrikRateLimit():
    | { remaining?: number; reset?: number; limit?: number }
    | undefined {
    return this.henrikRateLimit;
  }

  private axiosConfig: AxiosRequestConfig = {
    headers: {
      Authorization: process.env.HENRIK_API_KEY,
    },
  };

  constructor(private readonly httpService: HttpService) {}

  async getMatchesByPuuid(puuid: string, region: string): Promise<MatchlistV4> {
    const res = await firstValueFrom(
      this.httpService.get<{ data: any }>(
        `https://api.henrikdev.xyz/valorant/v4/by-puuid/matches/${region}/pc/${puuid}`,
        this.axiosConfig,
      ),
    );

    return MatchlistV4.parse(res.data.data);
  }

  async getAccountByName(name: string, tag: string): Promise<AccountV2> {
    const res = await firstValueFrom(
      this.httpService.get<{ data: any }>(
        `https://api.henrikdev.xyz/valorant/v2/account/${name}/${tag}`,
        this.axiosConfig,
      ),
    );

    return AccountV2.parse(res.data.data);
  }

  async getMatchById(id: string, region: string): Promise<CompetitiveSchema> {
    const body = {
      type: 'matchdetails',
      value: id,
      region: region,
    };

    const res = await firstValueFrom(
      this.httpService.post<{ data: any }>(
        'https://api.henrikdev.xyz/valorant/v1/raw',
        body,
        this.axiosConfig,
      ),
    );

    // Save rate limit info from headers if present
    if (res && res.headers) {
      this.henrikRateLimit = {
        remaining:
          res.headers['x-ratelimit-remaining'] !== undefined
            ? Number(res.headers['x-ratelimit-remaining'])
            : undefined,
        reset:
          res.headers['x-ratelimit-reset'] !== undefined
            ? Number(res.headers['x-ratelimit-reset'])
            : undefined,
        limit:
          res.headers['x-ratelimit-limit'] !== undefined
            ? Number(res.headers['x-ratelimit-limit'])
            : undefined,
      };
    }

    return CompetitiveSchema.parse(res.data.data);
  }

  @Cron('0 0 * * *')
  async refresh() {
    await this.updateMaps();
  }

  async updateMaps() {
    const res = await firstValueFrom(
      this.httpService.get<{ data: any }>('https://valorant-api.com/v1/maps'),
    );

    const maps = MapsResponse.parse(res.data.data);

    const mapsRecord: Record<string, string> = {};
    for (const map of maps) {
      mapsRecord[map.mapUrl] = map.uuid;
    }

    this.maps = mapsRecord;
  }

  getMaps(): Record<string, string> {
    return this.maps;
  }

  async updateCeremonies() {
    const res = await firstValueFrom(
      this.httpService.get<{ data: any }>(
        'https://valorant-api.com/v1/ceremonies',
      ),
    );

    const ceremonies = CeremoniesResponse.parse(res.data.data);

    const ceremoniesRecord: Record<string, string> = {};
    for (const ceremony of ceremonies) {
      ceremoniesRecord[ceremony.displayName] = ceremony.uuid;
    }

    this.ceremonies = ceremoniesRecord;
  }

  getCeremonies(): Record<string, string> {
    return this.ceremonies;
  }

  /**
   * Awaitable delay helper for rate limiting and queue control.
   */
  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async onModuleInit() {
    await this.refresh();
  }
}
