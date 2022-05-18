import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

import * as packages from "../package.json";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("CodingLand")
    .setDescription("CodingLand Official Server")
    .setVersion(packages.version)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("documentation", app, document);

  app.setGlobalPrefix("api");

  await app.listen(3100);
  console.log(`[DEBUG] Application is running on: ${await app.getUrl()}`);
  console.log(`[DEBUG] Application Documentation is running on: ${await app.getUrl()}/documentation`);
}

bootstrap();
