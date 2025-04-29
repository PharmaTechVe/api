import { ApiProperty, PartialType, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';

export class CouponDTO {
  @ApiProperty({
    description: 'Coupon code, maximum 10 characters',
    maxLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 10)
  code: string;

  @ApiProperty({ description: 'Discount applied to coupon' })
  @IsNotEmpty()
  @IsInt()
  discount: number;

  @ApiProperty({
    description: 'Minimum purchase amount to apply the coupon',
    example: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  minPurchase: number;

  @ApiProperty({ description: 'Maximum number of coupon uses' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  maxUses: number;

  @ApiProperty({
    description: 'Coupon expiration date',
    example: '2025-12-31T23:59:59Z',
  })
  @IsNotEmpty()
  @IsDateString()
  expirationDate: Date;
}

export class UpdateCouponDTO extends PartialType(CouponDTO) {}

export class ResponseCouponDTO extends IntersectionType(CouponDTO, BaseDTO) {}

export class CouponQueryDTO extends PaginationQueryDTO {
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
