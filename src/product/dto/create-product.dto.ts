import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Camiseta' })
  name: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Camiseta de algodón',
  })
  description: string;

  @ApiProperty({ description: 'Precio del producto', example: 25.99 })
  price: number;

  @ApiProperty({ description: 'Stock disponible', example: 100 })
  stock: number;

  @ApiProperty({
    description: 'URL de la imagen (opcional)',
    required: false,
    example: 'https://images.com/product.jpg',
  })
  imageUrl?: string;
}
