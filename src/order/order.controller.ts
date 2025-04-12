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
  Param,
  Patch,
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
import { UpdateDeliveryDTO } from './dto/update-order-delivery.dto';

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
      // Información del usuario:
      userName:
        delivery.order.user.firstName + ' ' + delivery.order.user.lastName,
      userPhone: delivery.order.user.phoneNumber,
      // Información de la dirección:
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
