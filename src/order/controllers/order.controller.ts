import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Get,
  UseInterceptors,
  Query,
  Param,
  ParseUUIDPipe,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from '../order.service';
import {
  CreateOrderDTO,
  OrderQueryDTO,
  ResponseOrderDetailedDTO,
  ResponseOrderDTO,
  UpdateOrderStatusDTO,
} from '../dto/order';
import { AuthGuard, CustomRequest } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { Order, OrderStatus, OrderType } from '../entities/order.entity';
import { UserRole } from 'src/user/entities/user.entity';
import { Roles } from 'src/auth/roles.decorador';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserValidatedGuard } from 'src/auth/guards/user-validated.guard';
import { plainToInstance } from 'class-transformer';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, UserValidatedGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new order',
    description: 'Creates a new order for the authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
    type: ResponseOrderDTO,
  })
  async create(
    @Req() req: CustomRequest,
    @Body() createOrderDTO: CreateOrderDTO,
  ) {
    const order = await this.orderService.create(req.user, createOrderDTO);
    return plainToInstance(ResponseOrderDTO, order, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UseInterceptors(PaginationInterceptor)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders' })
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
    description: 'Number of items per page',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'User ID to filter orders',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Order type to filter orders',
    type: String,
    enum: OrderType,
    example: OrderType.PICKUP,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Order status to filter orders',
    type: String,
    enum: OrderStatus,
    example: OrderStatus.REQUESTED,
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Branch ID to filter orders',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful retrieval of coupons',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(ResponseOrderDTO) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Req() req: CustomRequest,
    @Query() query: OrderQueryDTO,
  ): Promise<{ data: ResponseOrderDTO[]; total: number }> {
    const { page, limit, userId, branchId, status, type } = query;
    let user;
    if ([UserRole.ADMIN, UserRole.BRANCH_ADMIN].includes(req.user.role)) {
      if (userId) user = userId;
    } else {
      user = req.user.id;
    }
    const { orders, total } = await this.orderService.findAll(
      page,
      limit,
      user,
      branchId,
      status,
      type,
    );
    return {
      data: plainToInstance(ResponseOrderDTO, orders, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      total,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    description: 'Successful retrieval of order',
    status: HttpStatus.OK,
    type: ResponseOrderDetailedDTO,
  })
  async findOne(
    @Req() req: CustomRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    let order: Order;
    if ([UserRole.ADMIN, UserRole.BRANCH_ADMIN].includes(req.user.role)) {
      order = await this.orderService.findOne(id);
    } else if ([UserRole.DELIVERY].includes(req.user.role)) {
      order = await this.orderService.findOne(id);
      if (order.type !== OrderType.DELIVERY) {
        throw new NotFoundException('Order not found');
      }
      if (order.orderDeliveries.length === 0) {
        throw new NotFoundException('Order not found');
      }
      if (order.orderDeliveries[0].employee.id !== req.user.id) {
        throw new NotFoundException('Order not found');
      }
    } else {
      order = await this.orderService.findOne(id);
    }
    return plainToInstance(ResponseOrderDetailedDTO, order, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an order by ID' })
  @ApiResponse({
    description: 'Successful update of order',
    status: HttpStatus.OK,
    type: ResponseOrderDetailedDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
  ) {
    return await this.orderService.update(id, updateOrderStatusDTO.status);
  }
}
