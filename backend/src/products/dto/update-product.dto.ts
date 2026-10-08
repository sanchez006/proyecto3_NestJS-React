import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto.js';

/** PATCH: todos los campos son opcionales pero conservan sus validaciones. */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
