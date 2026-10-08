import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { CATEGORIES, type Category } from '../entities/product.entity.js';

/** Datos requeridos para crear un producto. */
export class CreateProductDto {
  @ApiProperty({
    example: 'MART-016',
    description: 'Código único: 3 a 20 caracteres en mayúsculas, números o guiones',
  })
  @IsString({ message: 'sku debe ser un texto' })
  @Matches(/^[A-Z0-9-]{3,20}$/, {
    message: 'sku debe tener de 3 a 20 caracteres: letras mayúsculas, números o guiones',
  })
  sku: string;

  @ApiProperty({ example: 'Martillo de uña 16 oz', maxLength: 80 })
  @IsString({ message: 'name debe ser un texto' })
  @IsNotEmpty({ message: 'name es obligatorio' })
  @MaxLength(80, { message: 'name no puede superar 80 caracteres' })
  name: string;

  @ApiProperty({ example: 85.5, description: 'Precio en quetzales, mayor que 0, máximo 2 decimales' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'price debe ser un número con máximo 2 decimales' })
  @IsPositive({ message: 'price debe ser mayor que 0' })
  price: number;

  @ApiProperty({ example: 20, minimum: 0, description: 'Unidades en existencia (entero)' })
  @IsInt({ message: 'stock debe ser un número entero' })
  @Min(0, { message: 'stock no puede ser negativo' })
  stock: number;

  @ApiProperty({ enum: CATEGORIES, example: 'herramientas' })
  @IsIn(CATEGORIES, { message: `category debe ser uno de: ${CATEGORIES.join(', ')}` })
  category: Category;

  @ApiPropertyOptional({ example: 'Mango de fibra de vidrio', maxLength: 300 })
  @IsOptional()
  @IsString({ message: 'description debe ser un texto' })
  @MaxLength(300, { message: 'description no puede superar 300 caracteres' })
  description?: string;
}
