import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { PredictedSaleDTO, PredictSalesDTO } from './dto/predict-sales.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @Get('predict')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Predict future daily sales',
    description:
      'Returns sales predictions starting from today for the number of future days specified.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of future days to predict (default: 7)',
    type: Number,
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'List of predicted daily sales values',
    type: [PredictedSaleDTO],
  })
  async predict(@Query() query: PredictSalesDTO): Promise<PredictedSaleDTO[]> {
    const salesData = await this.salesService.getDailySales();
    const dailySales = this.salesService.fillMissingDates(salesData);

    return await this.salesService.predictNext(query.days || 7, dailySales);
  }
}
