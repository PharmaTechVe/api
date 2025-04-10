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
import { Type } from 'class-transformer';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { BaseDTO } from 'src/utils/dto/base.dto';

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
  @ApiProperty({ description: 'ID of the product presentation' })
  @IsString()
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Quantity of products' })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Subtotal price of the order detail' })
  subtotal: number;
}

export class ResponseOrderDTO extends BaseDTO {
  @ApiProperty({ description: 'Type of order (PICKUP or DELIVERY)' })
  type: OrderType;

  @ApiProperty({ description: 'Status of the order' })
  status: OrderStatus;

  @ApiProperty({ description: 'Total price of the order' })
  totalPrice: number;

  @ApiProperty({
    description: 'Products in the order',
    type: [ResponseOrderDetailDTO],
  })
  details: ResponseOrderDetailDTO[];
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
