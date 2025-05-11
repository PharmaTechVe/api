import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PredictSalesDTO {
  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number = 7;
}

export class DailySaleDTO {
  date: string;
  total: number;
}

export class PredictedSaleDTO {
  @ApiProperty()
  date: string;

  @ApiProperty()
  @IsInt()
  predictedTotal: number;
}
