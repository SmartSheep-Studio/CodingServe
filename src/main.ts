import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const packageInfo = require('../package.json');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('HaloServer')
    .setDescription('HaloBMS 的后台服务器')
    .setVersion(packageInfo.version)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  app.setGlobalPrefix('api');

  await app.listen(3100);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Application Documentation is running on: ${await app.getUrl()}/documentation`,
  );
}

bootstrap();
