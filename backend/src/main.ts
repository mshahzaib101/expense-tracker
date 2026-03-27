import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getEnv } from './config/env';
import { configureApp } from './app.setup';

async function bootstrap() {
  const env = getEnv();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  configureApp(app);
  app.enableShutdownHooks();

  await app.listen(env.PORT);
  logger.log(`Backend running on http://localhost:${env.PORT}`);
}
void bootstrap();
