import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class PredictSalesDTO {
  @IsOptional()
  days?: string = '7';
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
