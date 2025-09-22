import { Body, Controller, Post } from '@nestjs/common';
import { CompetitiveSchema } from './competitive.schema';

@Controller('competitive')
export class CompetitiveController {
  @Post('trim')
  translateJson(@Body() body: any): CompetitiveSchema {
    return CompetitiveSchema.parse(body);
  }
}
