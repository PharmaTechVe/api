import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';
import { BaseDTO } from 'src/utils/dto/base.dto';

export class PromoDTO {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the promo' })
  name: string;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'The discount percentage of the promo' })
  discount: number;

  @Expose()
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The expiration date of the promo' })
  expiredAt: Date;

  @Expose()
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The start date of the promo' })
  startAt: Date;
}

export class UpdatePromoDTO extends PartialType(PromoDTO) {}

export class ResponsePromoDTO extends IntersectionType(BaseDTO, PromoDTO) {}
