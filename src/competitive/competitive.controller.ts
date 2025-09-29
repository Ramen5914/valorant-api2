import { Body, Controller, Get, Post } from '@nestjs/common';
import { CompetitiveSchema } from './competitive.schema';
import { ExternalService } from 'src/external/external.service';

@Controller('competitive')
export class CompetitiveController {
  constructor(private readonly externalService: ExternalService) {}

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
}
