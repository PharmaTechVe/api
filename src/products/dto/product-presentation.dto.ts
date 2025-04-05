import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { GenericProductDTO } from './generic-product.dto';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { ResponsePresentationDTO } from './presentation.dto';

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
}

export class UpdateProductPresentationDTO extends PartialType(
  CreateProductPresentationDTO,
) {}

export class ResponseProductPresentationDTO extends ProductPresentationDTO {
  @ApiProperty({ description: 'The ID of the product presentation' })
  id: string;

  @ApiProperty({})
  presentation: ResponsePresentationDTO;
}

export class ResponseProductPresentationDetailDTO extends IntersectionType(
  ProductPresentationDTO,
  BaseDTO,
) {
  @ApiProperty()
  product: GenericProductDTO;

  @ApiProperty({ type: ResponsePresentationDTO })
  presentation: ResponsePresentationDTO;
}
