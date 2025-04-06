import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';

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
  expiredAt: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The start date of the promo' })
  startAt: Date;
}

export class UpdatePromoDTO extends PartialType(PromoDTO) {}

export class ResponsePromoDTO extends PromoDTO {
  @ApiProperty({ description: 'The promo id' })
  id: string;
}
