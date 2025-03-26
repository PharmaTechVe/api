import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';
import { ResponseProductPresentationDTO } from '../dto/product-presentation.dto';

export class PromoDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the promo' })
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'The discount percentage of the promo' })
  discount: number;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The expiration date of the promo' })
  expired_at: Date;
}

export class CreatePromoDTO extends PromoDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the product presentation associated with the promo',
  })
  productPresentationId: string;
}

export class UpdatePromoDTO extends PartialType(CreatePromoDTO) {}

export class ResponsePromoDTO extends PromoDTO {
  @ApiProperty({ description: 'The promo id' })
  id: string;

  @ApiProperty({
    description: 'The presentation of the product associated with the promo',
  })
  productPresentation: ResponseProductPresentationDTO;
}
