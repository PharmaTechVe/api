import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';

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

export class PromoQueryDTO extends PaginationQueryDTO {
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? value.split(',').map((value) => new Date(value)) : [],
  )
  expirationBetween: Date[];

  constructor(
    page: number,
    limit: number,
    q?: string,
    expirationBetween?: Date[],
  ) {
    super(page, limit);
    this.q = q ? q : '';
    this.expirationBetween = expirationBetween ? expirationBetween : [];
  }
}
