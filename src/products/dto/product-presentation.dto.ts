import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
}
