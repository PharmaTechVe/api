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
import { ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FullSalesReportDTO } from './dto/sales.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
@Controller('report')
export class ReportsController {
  constructor(
    private readonly orderService: OrderService,
    private readonly userService: UserService,
  ) {}

  @Get('dashboard')
  @ApiBearerAuth()
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Start date in ISO format',
    example: '2023-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'End date in ISO format',
    example: '2023-01-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Branch ID to filter the orders',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data',
    example: {
      openOrders: 10,
      completedOrders: 20,
      totalSales: 1000,
      totalNewUsers: 5,
    },
  })
  async getDashboard(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
    @Query('branchId') branchId?: string,
  ) {
    if (!start || !end) {
      throw new BadRequestException('startDate and endDate are required');
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
  @ApiBearerAuth()
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Start date in ISO format',
    example: '2023-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'End date in ISO format',
    example: '2023-01-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Branch ID to filter the orders',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders count by status',
    example: {
      requested: 19,
      approved: 3,
      ready_for_pickup: 1,
      in_progress: 1,
      completed: 214,
    },
  })
  async getOrdersByStatus(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
    @Query('branchId') branchId?: string,
  ) {
    if (!start || !end) {
      throw new BadRequestException('startDate and endDate are required');
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    return this.orderService.countOrdersByStatus(startDate, endDate, branchId);
  }

  @Get('sale')
  @ApiBearerAuth()
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Start date in ISO format',
    example: '2023-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'End date in ISO format',
    example: '2023-01-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Branch ID to filter the sales report',
  })
  @ApiResponse({
    status: 200,
    description: 'Sales report',
    type: FullSalesReportDTO,
  })
  async getSalesReport(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
    @Query('branchId') branchId?: string,
  ) {
    if (!start || !end) {
      throw new BadRequestException('startDate and endDate are required');
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    const items = await this.orderService.getSalesReport(
      startDate,
      endDate,
      branchId,
    );
    const totals = items.reduce(
      (acc, { subtotal, discount, total }) => {
        acc.subtotal += subtotal;
        acc.discount += discount;
        acc.total += total;
        return acc;
      },
      { subtotal: 0, discount: 0, total: 0 },
    );
    return {
      items,
      totals,
    };
  }
}
