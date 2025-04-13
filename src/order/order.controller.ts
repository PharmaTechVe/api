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
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderDTO,
  OrderQueryDTO,
  ResponseOrderDetailedDTO,
  ResponseOrderDTO,
  UpdateOrderStatusDTO,
} from './dto/order';
import { AuthGuard, CustomRequest } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import {
  PaginationDTO,
  PaginationQueryDTO,
} from 'src/utils/dto/pagination.dto';
import { OrderStatus, OrderType } from './entities/order.entity';
import { UserRole } from 'src/user/entities/user.entity';
import { Roles } from 'src/auth/roles.decorador';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserValidatedGuard } from 'src/auth/guards/user-validated.guard';
import { OrderDeliveryDTO } from './dto/response-order-delivery.dto';
import { UpdateDeliveryDTO } from './dto/update-order-delivery.dto';
import { User } from 'src/user/entities/user.entity';
import { Pagination } from 'src/utils/pagination.decorator';

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
  create(@Req() req: CustomRequest, @Body() createOrderDTO: CreateOrderDTO) {
    return this.orderService.create(req.user, createOrderDTO);
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
    const { page, limit, userId, branchId, status } = query;
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
    );
    return {
      data: orders,
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
    let order;
    if ([UserRole.ADMIN, UserRole.BRANCH_ADMIN].includes(req.user.role)) {
      order = await this.orderService.findOne(id);
    } else {
      order = await this.orderService.findOne(id, req.user.id);
    }
    return order;
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

  @Get('/delivery/:deliveryId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get detailed delivery info including contact and address',
  })
  @ApiResponse({ status: HttpStatus.OK, type: OrderDeliveryDTO })
  async getDelivery(
    @Param('deliveryId') deliveryId: string,
  ): Promise<OrderDeliveryDTO> {
    const delivery = await this.orderService.getDelivery(deliveryId);

    return {
      id: delivery.id,
      orderId: delivery.order.id,
      deliveryStatus: delivery.deliveryStatus,
      estimatedTime: delivery.estimatedTime,
      branchId: delivery.branch ? delivery.branch.id : null,
      employeeId: delivery.employee ? delivery.employee.id : null,
      // Data of user:
      userName:
        delivery.order.user.firstName + ' ' + delivery.order.user.lastName,
      userPhone: delivery.order.user.phoneNumber,
      // data of the address:
      address: delivery.adress.adress,
      zipCode: delivery.adress.zipCode,
      additionalInformation: delivery.adress.additionalInformation,
      referencePoint: delivery.adress.referencePoint,
    };
  }

  @Patch('/delivery/:deliveryId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update delivery status or reject delivery (unassign employee)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: OrderDeliveryDTO })
  async updateDelivery(
    @Req() req: Request & { user?: User },
    @Param('deliveryId') deliveryId: string,
    @Body() updateDeliveryDto: UpdateDeliveryDTO,
  ): Promise<OrderDeliveryDTO> {
    const user = req.user as User;
    const updatedDelivery = await this.orderService.updateDelivery(
      user,
      deliveryId,
      updateDeliveryDto,
    );

    return {
      id: updatedDelivery.id,
      orderId: updatedDelivery.order.id,
      deliveryStatus: updatedDelivery.deliveryStatus,
      estimatedTime: updatedDelivery.estimatedTime,
      branchId: updatedDelivery.branch ? updatedDelivery.branch.id : null,
      employeeId: updatedDelivery.employee ? updatedDelivery.employee.id : null,
    };
  }
}
