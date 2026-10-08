import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/error-response.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './entities/product.entity.js';
import { ProductsService } from './products.service.js';

/** Capa HTTP: rutas, códigos de estado y documentación. La lógica está en el servicio. */
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(@Inject(ProductsService) private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los productos' })
  @ApiOkResponse({ type: [Product], description: '200: colección de productos' })
  findAll(): Product[] {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por id' })
  @ApiOkResponse({ type: Product, description: '200: producto encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: '400: el id no es numérico' })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: '404: no existe el producto' })
  findOne(@Param('id', ParseIntPipe) id: number): Product {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiCreatedResponse({ type: Product, description: '201: producto creado' })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: '400: datos inválidos o propiedades desconocidas' })
  @ApiConflictResponse({ type: ErrorResponseDto, description: '409: el SKU ya existe' })
  create(@Body() dto: CreateProductDto): Product {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente un producto' })
  @ApiOkResponse({ type: Product, description: '200: producto actualizado' })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: '400: datos inválidos o cuerpo vacío' })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: '404: no existe el producto' })
  @ApiConflictResponse({ type: ErrorResponseDto, description: '409: el nuevo SKU ya lo usa otro producto' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto): Product {
    const hasChanges = Object.values(dto).some((value) => value !== undefined);
    if (!hasChanges) {
      throw new BadRequestException('Debe enviar al menos un campo para actualizar');
    }
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiNoContentResponse({ description: '204: eliminado, sin cuerpo de respuesta' })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: '400: el id no es numérico' })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: '404: no existe el producto' })
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.productsService.remove(id);
  }
}
