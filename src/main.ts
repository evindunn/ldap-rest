import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import dotenv from "dotenv";
import helmet from "helmet";

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  await app.listen(process.env.APP_PORT || 8080);
}

bootstrap();
