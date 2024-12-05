import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';


// import * as dotenv from 'dotenv';
import 'reflect-metadata';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3002);
  app.use(cookieParser())
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
