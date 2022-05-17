import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

import packages from "../package.json";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const config = new DocumentBuilder()
    .setTitle("CodingLand")
    .setDescription("CodingLand Official Server")
    .setVersion(packages.version)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("documentation", app, document);

  app.setGlobalPrefix("api");

  await app.listen(3100);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Application Documentation is running on: ${await app.getUrl()}/documentation`);
}

bootstrap();
