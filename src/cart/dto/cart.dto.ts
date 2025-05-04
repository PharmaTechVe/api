import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  Min,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { ResponseOrderProductPresentationDetailDTO } from 'src/products/dto/product-presentation.dto';

export class BaseCartItemDTO {
  @Expose()
  @ApiProperty({ description: 'product presentation quantity', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateCartItemDTO extends BaseCartItemDTO {
  @Expose()
  @ApiProperty({ description: 'ID of the product presentation' })
  @IsUUID()
  productPresentationId: string;
}

export class CartItemDTO extends BaseCartItemDTO {
  @Expose()
  @ApiProperty({ description: 'ID of item in the cart' })
  @IsUUID()
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Product presentation',
    type: ResponseOrderProductPresentationDetailDTO,
  })
  @Type(() => ResponseOrderProductPresentationDetailDTO)
  productPresentation: ResponseOrderProductPresentationDetailDTO;
}

export class CreateCartDTO {
  @ApiProperty({
    description: 'Items list',
    type: [CreateCartItemDTO],
  })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDTO)
  items: CreateCartItemDTO[];
}

export class UpdateCartDTO {
  @ApiProperty({
    description: 'Items list',
    type: [CreateCartItemDTO],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDTO)
  items: CreateCartItemDTO[];
}

export class CartDTO {
  @Expose()
  @ApiProperty({ description: 'ID of the cart' })
  @IsUUID()
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Cart items',
    type: [CartItemDTO],
  })
  @Type(() => CartItemDTO)
  items: CartItemDTO[];
}
