import {
  Controller,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Get,
  UseInterceptors,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { OrderService } from '../order.service';
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
import {
  OrderDeliveryDTO,
  OrderDeliveryQueryDTO,
  UpdateDeliveryDTO,
} from '../dto/order-delivery.dto';
import { User } from 'src/user/entities/user.entity';
import { plainToInstance } from 'class-transformer';

@Controller('delivery')
export class OrderDeliveryController {
  constructor(private readonly orderService: OrderService) {}
  @Get()
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
    name: 'status',
    required: false,
    description: 'status',
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
    @Req() req: CustomRequest,
    @Query() pagination: OrderDeliveryQueryDTO,
  ): Promise<{ data: OrderDeliveryDTO[]; total: number }> {
    const { page, limit, status, branchId, employeeId } = pagination;
    const data = await this.orderService.findAllOD(req.user, page, limit, {
      status,
      branchId,
      employeeId,
    });
    const total = await this.orderService.countDeliveries(req.user, {
      status,
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

  @Get('/:deliveryId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get detailed delivery info including contact and address',
  })
  @ApiResponse({ status: HttpStatus.OK, type: OrderDeliveryDTO })
  async getDelivery(
    @Param('deliveryId') deliveryId: string,
  ): Promise<OrderDeliveryDTO> {
    const delivery = await this.orderService.getDelivery(deliveryId);

    return plainToInstance(OrderDeliveryDTO, {
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
    });
  }

  @Patch('/:deliveryId')
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

    return plainToInstance(OrderDeliveryDTO, {
      id: updatedDelivery.id,
      orderId: updatedDelivery.order.id,
      deliveryStatus: updatedDelivery.deliveryStatus,
      estimatedTime: updatedDelivery.estimatedTime,
      branchId: updatedDelivery.branch ? updatedDelivery.branch.id : null,
      employeeId: updatedDelivery.employee ? updatedDelivery.employee.id : null,
    });
  }
}
