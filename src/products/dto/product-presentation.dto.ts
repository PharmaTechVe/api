import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  GenericProductDTO,
  ResponseOrderGenericProductDTO,
} from './generic-product.dto';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { ResponsePresentationDTO } from './presentation.dto';
import { ResponsePromoDTO } from '../../discount/dto/promo.dto';

export class ProductPresentationDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'The price of the product presentation.' })
  price: number;
}

export class CreateProductPresentationDTO extends ProductPresentationDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The ID of the associated product' })
  productId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The ID of the associated presentation' })
  presentationId: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  @ApiProperty({ description: 'The ID of the associated promo' })
  promoId?: string | null;
}

export class UpdateProductPresentationDTO extends PartialType(
  CreateProductPresentationDTO,
) {}

export class ResponseProductPresentationDTO extends ProductPresentationDTO {
  @ApiProperty({ description: 'The ID of the product presentation' })
  id: string;

  @ApiProperty({ type: ResponsePresentationDTO })
  presentation: ResponsePresentationDTO;

  @ApiProperty({ type: ResponsePromoDTO })
  promo: ResponsePromoDTO;
}

export class ResponseProductPresentationDetailDTO extends IntersectionType(
  ProductPresentationDTO,
  BaseDTO,
) {
  @ApiProperty()
  product: GenericProductDTO;

  @ApiProperty({ type: ResponsePresentationDTO })
  presentation: ResponsePresentationDTO;

  @ApiProperty({ type: ResponsePromoDTO })
  promo: ResponsePromoDTO;
}

export class ResponseOrderProductPresentationDetailDTO extends IntersectionType(
  ProductPresentationDTO,
  BaseDTO,
) {
  @ApiProperty({ type: ResponseOrderGenericProductDTO })
  product: ResponseOrderGenericProductDTO;

  @ApiProperty({ type: ResponsePresentationDTO })
  presentation: ResponsePresentationDTO;

  @ApiProperty({ type: ResponsePromoDTO })
  promo: ResponsePromoDTO;
}
