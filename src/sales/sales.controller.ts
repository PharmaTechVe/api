import { Controller, Get, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { PredictedSaleDTO, PredictSalesDTO } from './dto/predict-sales.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('predict')
  async predict(@Query() query: PredictSalesDTO): Promise<PredictedSaleDTO[]> {
    return await this.salesService.predictNext(query.daysAhead || 7);
  }
}
