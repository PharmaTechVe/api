import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/order';
import { AuthGuard, CustomRequest } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
  ApiQuery,
} from '@nestjs/swagger';
import {
  PaginationDTO,
  PaginationQueryDTO,
} from 'src/utils/dto/pagination.dto';
import { OrderDeliveryDTO } from './dto/response-order-delivery.dto';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { Pagination } from 'src/utils/pagination.decorator';
import { User } from 'src/user/entities/user.entity';
import { Request } from 'express';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new order',
    description: 'Creates a new order for the authenticated user.',
  })
  create(@Req() req: CustomRequest, @Body() createOrderDTO: CreateOrderDTO) {
    return this.orderService.create(req.user, createOrderDTO);
  }

  @Get('/delivery')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List all deliveries with filters' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'deliveryStatus',
    required: false,
    description: 'Filter by delivery status',
    type: String,
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Filter by branch ID',
    type: String,
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'For admin: Filter by employee (motorizado) ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(OrderDeliveryDTO) },
            },
          },
        },
      ],
    },
  })
  async findAllOD(
    @Req() req: Request & { user?: User },
    @Pagination() pagination: PaginationQueryDTO,
    @Query('deliveryStatus') deliveryStatus?: string,
    @Query('branchId') branchId?: string,
    @Query('employeeId') employeeId?: string,
  ): Promise<{ data: OrderDeliveryDTO[]; total: number }> {
    const user = req.user as User;
    const { page, limit } = pagination;
    const data = await this.orderService.findAllOD(user, page, limit, {
      deliveryStatus,
      branchId,
      employeeId,
    });
    const total = await this.orderService.countDeliveries(user, {
      deliveryStatus,
      branchId,
      employeeId,
    });

    const results: OrderDeliveryDTO[] = data.map((delivery) => ({
      id: delivery.id,
      orderId: delivery.order.id,
      deliveryStatus: delivery.deliveryStatus,
      estimatedTime: delivery.estimatedTime,
      branchId: delivery.branch ? delivery.branch.id : null,
      employeeId: delivery.employee ? delivery.employee.id : null,
    }));

    return { data: results, total };
  }
}
