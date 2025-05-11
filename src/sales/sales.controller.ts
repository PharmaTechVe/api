import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { PredictedSaleDTO, PredictSalesDTO } from './dto/predict-sales.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @Get('predict')
  async predict(@Query() query: PredictSalesDTO): Promise<PredictedSaleDTO[]> {
    const salesData = await this.salesService.getDailySales();
    const dailySales = this.salesService.fillMissingDates(salesData);

    return await this.salesService.predictNext(
      query.daysAhead || 7,
      dailySales,
    );
  }
}
