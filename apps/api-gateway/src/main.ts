import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module";
import { ZodValidationPipe } from "./common/validation/zod-validation.pipe";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(new ZodValidationPipe());

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port);

  app.get(Logger).log(
    `api-gateway слухає http://localhost:${port}`,
    "Bootstrap",
  );
}

void bootstrap();
