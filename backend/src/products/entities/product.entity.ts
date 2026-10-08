import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const CATEGORIES = ['herramientas', 'electricidad', 'plomeria', 'pintura'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Recurso tal como lo devuelve la API. */
export class Product {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'MART-016' })
  sku: string;

  @ApiProperty({ example: 'Martillo de uña 16 oz' })
  name: string;

  @ApiProperty({ example: 85.5 })
  price: number;

  @ApiProperty({ example: 20 })
  stock: number;

  @ApiProperty({ enum: CATEGORIES, example: 'herramientas' })
  category: Category;

  @ApiPropertyOptional({ example: 'Mango de fibra de vidrio' })
  description?: string;

  @ApiProperty({ example: '2026-10-07T15:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-10-07T15:00:00.000Z' })
  updatedAt: string;
}
