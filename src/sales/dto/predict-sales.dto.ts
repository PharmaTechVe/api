import { IsInt, IsOptional, Min } from 'class-validator';

export class PredictSalesDTO {
  @IsOptional()
  @IsInt()
  @Min(1)
  daysAhead?: number = 7;
}

export class DailySaleDTO {
  date: string;
  total: number;
}

export class PredictedSaleDTO {
  date: string;
  predictedTotal: number;
}
