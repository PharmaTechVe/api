import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPositive,
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
import { Expose, Type } from 'class-transformer';

export class ProductPresentationDTO {
  @Expose()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ description: 'The price of the product presentation.' })
  price: number;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Indicates if the product presentation is visible.',
    default: true,
  })
  isVisible: boolean;
}

export class CreateProductPresentationDTO extends ProductPresentationDTO {
  @ApiProperty()
  @IsString()
  presentationId: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  @ApiProperty({ description: 'The ID of the associated promo' })
  promoId?: string;
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
  @Expose()
  @Type(() => ResponseOrderGenericProductDTO)
  @ApiProperty({ type: ResponseOrderGenericProductDTO })
  product: ResponseOrderGenericProductDTO;

  @Expose()
  @Type(() => ResponsePresentationDTO)
  @ApiProperty({ type: ResponsePresentationDTO })
  presentation: ResponsePresentationDTO;

  @Expose()
  @Type(() => ResponsePromoDTO)
  @ApiProperty({ type: ResponsePromoDTO })
  promo: ResponsePromoDTO;
}

export class ProductPresentationListUpdateDTO {
  @ApiProperty({ description: 'The IDs of the product presentation' })
  @IsUUID(undefined, { each: true })
  ids: string[];

  @ApiProperty({
    description: 'Indicates if the product presentation is visible',
    default: true,
  })
  @IsBoolean()
  isVisible: boolean;
}
