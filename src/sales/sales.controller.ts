import { Controller, Get, Query } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('predict')
  async predict(@Query('days') days: string) {
    const daysAhead = parseInt(days, 10) || 7;
    return await this.salesService.predictNext(daysAhead);
  }
}
