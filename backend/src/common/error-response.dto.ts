import { ApiProperty } from '@nestjs/swagger';

/** Forma única de todas las respuestas de error de la API. */
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: ['price debe ser mayor que 0'], type: [String] })
  message: string[];

  @ApiProperty({ example: '/products' })
  path: string;

  @ApiProperty({ example: '2026-10-07T15:00:00.000Z' })
  timestamp: string;
}
