import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Expose, Transform, Type } from 'class-transformer';
import { BaseUserDTO } from 'src/user/dto/user.dto';
import { UserAddressDTO } from 'src/user/dto/user-address.dto';
import { OrderDeliveryStatus } from '../entities/order_delivery.entity';
import { BaseDTO } from 'src/utils/dto/base.dto';

export class EmployeeDTO {
  @Expose()
  @ApiProperty({ description: 'First name of the employee' })
  firstName: string;

  @Expose()
  @ApiProperty({ description: 'Last name of the employee' })
  lastName: string;

  @Expose()
  @ApiProperty({ description: 'Phone number of the employee' })
  phoneNumber: string;
}

class BaseOrderDeliveryDTO {
  @Expose()
  @ApiProperty({ description: 'Status of the order delivery' })
  deliveryStatus: OrderDeliveryStatus;

  @ApiProperty({ description: 'Estimated time for delivery' })
  @IsDateString()
  @Expose()
  estimatedTime: Date;
}

export class OrderDeliveryDTO extends IntersectionType(
  BaseDTO,
  BaseOrderDeliveryDTO,
) {
  @ApiProperty({ description: 'Id of the associated order' })
  @Expose()
  @Transform(({ obj }: { obj: { order?: { id: string } } }) => obj.order?.id)
  orderId: string;

  @ApiProperty({
    description: 'Id of the branch associated with the delivery',
    nullable: true,
  })
  @Expose()
  @Transform(({ obj }: { obj: { branch?: { id: string } } }) => obj.branch?.id)
  branchId: string | null;

  @ApiProperty({
    description: 'Id of the employee ("motorizado") assigned to the delivery',
    nullable: true,
  })
  @Expose()
  @Transform(
    ({ obj }: { obj: { employee?: { id: string } } }) => obj.employee?.id,
  )
  employeeId: string | null;

  // User contact information (extracted from the order)
  @ApiProperty({ description: 'User contact info', type: BaseUserDTO })
  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: {
        order: {
          user: {
            firstName: string;
            lastName: string;
            phoneNumber?: string;
            email?: string;
            profile?: { profilePicture?: string };
          };
        };
      };
    }) => ({
      firstName: obj.order.user.firstName,
      lastName: obj.order.user.lastName,
      phoneNumber: obj.order.user.phoneNumber,
      email: obj.order.user.email,
      profilePicture: obj.order.user.profile?.profilePicture,
    }),
    { toClassOnly: true },
  )
  @Type(() => BaseUserDTO)
  user: BaseUserDTO;

  // Delivery address information
  @ApiPropertyOptional({
    description: 'Delivery address info',
    type: UserAddressDTO,
    nullable: true,
  })
  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: {
        address?: {
          adress?: string;
          additionalInformation?: string;
          referencePoint?: string;
          latitude?: number;
          longitude?: number;
        };
      };
    }) => ({
      adress: obj.address?.adress,
      additionalInformation: obj.address?.additionalInformation,
      referencePoint: obj.address?.referencePoint,
      latitude: obj.address?.latitude,
      longitude: obj.address?.longitude,
    }),
    { toClassOnly: true },
  )
  @Type(() => UserAddressDTO)
  address?: UserAddressDTO;
}

export class UpdateDeliveryDTO {
  @ApiPropertyOptional({ description: 'New delivery status' })
  @IsOptional()
  @IsString()
  deliveryStatus?: string;

  @ApiPropertyOptional({
    description: 'indicate the delivery is rejected (employee unassign)',
  })
  @IsOptional()
  employeeId?: string;
}

export class OrderDeliveryQueryDTO extends PaginationQueryDTO {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;
}

export class OrderDeliveryEmployeeDTO extends IntersectionType(
  BaseDTO,
  BaseOrderDeliveryDTO,
) {
  @Expose()
  @ApiProperty({ description: 'Delivery address info', type: EmployeeDTO })
  @Type(() => EmployeeDTO)
  employee: EmployeeDTO;
}
