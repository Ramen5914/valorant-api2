import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CompetitiveSchema } from './competitive.schema';
import { ExternalService } from 'src/external/external.service';
import { Match } from './entities/match.entity';
import { CompetitiveService } from './competitive.service';

@Controller('competitive')
export class CompetitiveController {
  constructor(
    private readonly externalService: ExternalService,
    private readonly competitiveService: CompetitiveService,
  ) {}

  @Post('trim')
  translateJson(@Body() body: any): CompetitiveSchema {
    return CompetitiveSchema.parse(body);
  }

  @Get('test')
  test() {
    return this.externalService.getMatchesByPuuid(
      '73130adc-adec-5d41-8002-e8fb99cbd8fc',
      'na',
    );
  }

  @Post('input')
  async saveMatch(@Body() body: any): Promise<Match> {
    return await this.competitiveService.createMatch(
      CompetitiveSchema.parse(body),
    );
  }

  @Get(':id')
  async getMatchById(@Param('id') id: string): Promise<Match | null> {
    return await this.competitiveService.getMatchById(id);
  }
}
