import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ErrorResponseDto } from './error-response.dto.js';

/**
 * Normaliza las excepciones estándar de Nest (BadRequest, NotFound, Conflict…)
 * para que todos los errores tengan la misma forma: `message` siempre es un arreglo.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();
    const body = exception.getResponse();

    let error = exception.name;
    let message: string[] = [exception.message];

    if (typeof body === 'string') {
      message = [body];
    } else if (typeof body === 'object' && body !== null) {
      if ('error' in body && typeof body.error === 'string') error = body.error;
      if ('message' in body) {
        if (Array.isArray(body.message)) message = body.message.map(String);
        else if (typeof body.message === 'string') message = [body.message];
      }
    }

    const payload: ErrorResponseDto = {
      statusCode,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };
    response.status(statusCode).json(payload);
  }
}
