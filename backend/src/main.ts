import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp, FRONTEND_ORIGIN } from './setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API:     http://localhost:${port}/products`);
  console.log(`OpenAPI: http://localhost:${port}/docs`);
  console.log(`CORS permitido para: ${FRONTEND_ORIGIN}`);
}
await bootstrap();
