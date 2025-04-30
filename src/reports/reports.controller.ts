import {
  Controller,
  Get,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { UserService } from 'src/user/user.service';
import { OrderStatus } from 'src/order/entities/order.entity';
import { Roles } from 'src/auth/roles.decorador';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/user/entities/user.entity';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('report')
export class ReportsController {
  constructor(
    private readonly orderService: OrderService,
    private readonly userService: UserService,
  ) {}

  @Get('dashboard')
  async getDashboard(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
    @Query('branchId') branchId?: string,
  ) {
    if (!start || !end) {
      throw new BadRequestException('startDate y endDate son requeridos');
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    const [openOrders, completedOrders, totalSales, totalNewUsers] =
      await Promise.all([
        this.orderService.countOpenOrders(startDate, endDate, branchId),
        this.orderService.countOrdersCompleted(
          OrderStatus.COMPLETED,
          startDate,
          endDate,
          branchId,
        ),
        this.orderService.sumTotalSales(startDate, endDate, branchId),
        this.userService.countNewUsers(startDate, endDate),
      ]);

    return {
      openOrders,
      completedOrders,
      totalSales,
      totalNewUsers,
    };
  }
  @Get('order')
  async getOrdersByStatus(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
    @Query('branchId') branchId?: string,
  ) {
    if (!start || !end) {
      throw new BadRequestException('startDate y endDate son requeridos');
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    return this.orderService.countOrdersByStatus(startDate, endDate, branchId);
  }
}
