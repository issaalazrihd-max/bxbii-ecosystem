import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  // rawBody: true additionally exposes req.rawBody (a Buffer) on every
  // request, alongside the normal parsed req.body — needed to verify
  // Paddle's webhook signature, which is computed over the exact raw bytes
  // Paddle sent, not a re-serialized JSON.stringify(req.body). This does not
  // change how req.body is parsed or behaves for any existing route.
  const app = await NestFactory.create(AppModule, { cors: true, rawBody: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix("api/v1");

  const port = process.env.API_PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`EduSec Cloud API listening on http://localhost:${port}/api/v1`);
}
bootstrap();
