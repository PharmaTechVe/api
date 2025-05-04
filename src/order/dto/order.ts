import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderStatus, OrderType } from '../entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { ResponseOrderProductPresentationDetailDTO } from 'src/products/dto/product-presentation.dto';
import { ResponseBranchDTO } from 'src/branch/dto/branch.dto';
import { OrderDeliveryEmployeeDTO } from './order-delivery.dto';

export class CreateOrderDetailDTO {
  @ApiProperty({ description: 'ID of the product presentation' })
  @IsString()
  @IsUUID()
  productPresentationId: string;

  @ApiProperty({ description: 'Quantity of products' })
  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class CreateOrderDTO {
  @ApiProperty({
    description: 'Type of order (PICKUP or DELIVERY)',
    enum: OrderType,
  })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({ description: 'ID of the branch for pickup orders' })
  @IsString()
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiProperty({ description: 'ID of the user address for delivery orders' })
  @IsString()
  @IsUUID()
  @IsOptional()
  userAddressId?: string;

  @ApiProperty({
    description: 'Código de cupón (opcional)',
    example: 'SAVE10B',
    required: false,
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({
    description: 'List of products in the order',
    type: [CreateOrderDetailDTO],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDTO)
  products: CreateOrderDetailDTO[];

  constructor(
    type: OrderType,
    products: CreateOrderDetailDTO[],
    branchId?: string,
    userAddressId?: string,
  ) {
    if (type === OrderType.PICKUP && !branchId) {
      throw new Error('Branch ID is required for pickup orders');
    }
    if (type === OrderType.DELIVERY && !userAddressId) {
      throw new Error('User address ID is required for delivery orders');
    }
    this.type = type;
    this.branchId = branchId;
    this.userAddressId = userAddressId;
    this.products = products;
  }
}

export class ResponseOrderDetailDTO {
  @Expose()
  @ApiProperty({
    description: 'ID of the product presentation',
    type: ResponseOrderProductPresentationDetailDTO,
  })
  @Type(() => ResponseOrderProductPresentationDetailDTO)
  productPresentation: ResponseOrderProductPresentationDetailDTO;

  @Expose()
  @ApiProperty({ description: 'Quantity of products' })
  @IsInt()
  @IsPositive()
  quantity: number;

  @Expose()
  @ApiProperty({ description: 'Subtotal price of the order detail' })
  subtotal: number;
}

export class ResponseOrderDTO extends BaseDTO {
  @Expose()
  @ApiProperty({ description: 'Type of order (PICKUP or DELIVERY)' })
  type: OrderType;

  @Expose()
  @ApiProperty({ description: 'Status of the order' })
  status: OrderStatus;

  @Expose()
  @ApiProperty({ description: 'Total price of the order' })
  totalPrice: number;
}

export class ResponseOrderDetailedDTO extends ResponseOrderDTO {
  @Expose()
  @ApiProperty({
    description: 'Products in the order',
    type: [ResponseOrderDetailDTO],
  })
  @Type(() => ResponseOrderDetailDTO)
  details: ResponseOrderDetailDTO[];

  @Expose()
  @ApiProperty({
    description: 'Branch information',
    type: ResponseBranchDTO,
  })
  @Type(() => ResponseBranchDTO)
  branch?: ResponseBranchDTO;

  @Expose()
  @ApiProperty({
    description: 'Delivery information',
    type: [OrderDeliveryEmployeeDTO],
  })
  @Type(() => OrderDeliveryEmployeeDTO)
  orderDeliveries?: OrderDeliveryEmployeeDTO[];
}

export class OrderQueryDTO extends PaginationQueryDTO {
  @ApiProperty({ description: 'ID of the user' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'ID of the branch' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ description: 'Type of order (PICKUP or DELIVERY)' })
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @ApiProperty({ description: 'Status of the order' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class UpdateOrderStatusDTO {
  @ApiProperty({
    description: 'New status of the order',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class UpdateOrderStatusWsDTO {
  @ApiProperty({ description: 'ID of the order' })
  @IsString()
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'New status of the order',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class SalesReportDTO {
  @Expose()
  @ApiProperty({ description: 'ID of the order' })
  orderId: string;

  @Expose()
  @ApiProperty({ description: 'Full name of the user' })
  user: string;

  @Expose()
  @ApiProperty({ description: 'Date of the order' })
  date: Date;

  @Expose()
  @ApiProperty({ description: 'Order Type PICKUP or DELIVERY' })
  type: string;

  @Expose()
  @ApiProperty({ description: 'Products quantity of the order' })
  quantity: number;

  @Expose()
  @ApiProperty({ description: 'Subtotal of the order' })
  subtotal: number;

  @Expose()
  @ApiProperty({ description: 'Discount of the order' })
  discount: number;

  @Expose()
  @ApiProperty({ description: 'Total of the order' })
  total: number;
}
