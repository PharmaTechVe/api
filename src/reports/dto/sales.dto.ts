import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SalesReportDTO } from 'src/order/dto/order';

export class TotalSalesReportDTO {
  @Expose()
  @ApiProperty({ description: 'Total subtotal of the report' })
  subtotal: number;

  @Expose()
  @ApiProperty({ description: 'Total discount of the report' })
  discount: number;

  @Expose()
  @ApiProperty({ description: 'Total amount of the report' })
  total: number;
}

export class FullSalesReportDTO {
  @Expose()
  @ApiProperty({ description: 'Items of the report', type: [SalesReportDTO] })
  @Type(() => SalesReportDTO)
  items: SalesReportDTO[];

  @Expose()
  @ApiProperty({ description: 'Total sums of the report' })
  @Type(() => TotalSalesReportDTO)
  totals: TotalSalesReportDTO;
}
