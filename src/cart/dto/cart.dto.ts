import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  Min,
  ArrayNotEmpty,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type, Expose, Transform } from 'class-transformer';

export class CartItemDTO {
  @Expose()
  @ApiProperty({ description: 'ID of item in the cart' })
  @IsUUID()
  id: string;

  @Expose()
  @Transform(({ obj }: { obj: { product: { id: string } } }) => obj.product.id)
  @ApiProperty({ description: 'ID de la presentación del producto' })
  @IsUUID()
  productId: string;

  @Expose()
  @ApiProperty({ description: 'Cantidad del producto', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @Expose()
  @Transform(
    ({ obj }: { obj: { product: { product: { name: string } } } }) =>
      obj.product.product.name,
  )
  @ApiProperty({
    description: 'Nombre o descripción breve del producto',
    required: false,
  })
  @IsOptional()
  name?: string;
}

export class CreateCartItemDTO {
  @ApiProperty({ description: 'ID de la presentación del producto' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Cantidad del producto', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateCartDTO {
  @ApiProperty({
    description: 'Lista de ítems a agregar',
    type: [CreateCartItemDTO],
  })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDTO)
  items: CreateCartItemDTO[];
}

export class UpdateCartDTO {
  @ApiProperty({
    description: 'Lista actualizada de ítems',
    type: [CreateCartItemDTO],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDTO)
  items: CreateCartItemDTO[];
}

export class CartDTO {
  @Expose()
  @ApiProperty({ description: 'ID del carrito' })
  @IsUUID()
  id: string;

  @Expose()
  @Transform(({ obj }: { obj: { user: { id: string } } }) => obj.user.id)
  @ApiProperty({ description: 'ID del usuario dueño del carrito' })
  @IsUUID()
  userId: string;

  @Expose()
  @ApiProperty({
    description: 'Ítems en el carrito',
    type: [CartItemDTO],
  })
  @Type(() => CartItemDTO)
  items: CartItemDTO[];
}
