import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/http-exception.filter.js';

export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

/** Configuración global compartida por main.ts y las pruebas e2e. */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades sin decoradores
      forbidNonWhitelisted: true, // ...y responde 400 si llegan
      transform: true, // convierte el cuerpo en instancia del DTO
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Solo el origen exacto del frontend puede llamar a la API desde el navegador.
  app.enableCors({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  });

  const config = new DocumentBuilder()
    .setTitle('Inventario Ferretería API')
    .setDescription('API REST de productos con validación y errores consistentes. Datos en memoria.')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, config));
}
