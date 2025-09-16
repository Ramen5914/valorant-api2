import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  app.useBodyParser('json', { limit: '5mb' });
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
