import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Expose, Transform, Type } from 'class-transformer';
import { BaseUserDTO } from 'src/user/dto/user.dto';
import { UserAddressDTO } from 'src/user/dto/user-address.dto';

export class OrderDeliveryDTO {
  @ApiProperty({ description: 'Unique identifier of the delivery' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Id of the associated order' })
  @Expose()
  @Transform(({ obj }: { obj: { order?: { id: string } } }) => obj.order?.id)
  orderId: string;

  @ApiProperty({
    description: 'Delivery status (e.g., pending, delivered, etc.)',
  })
  @Expose()
  deliveryStatus: string;

  @ApiProperty({ description: 'Estimated time for delivery' })
  @IsDateString()
  @Expose()
  estimatedTime: Date;

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
          user: { firstName: string; lastName: string; phoneNumber?: string };
        };
      };
    }) => ({
      firstName: obj.order.user.firstName,
      lastName: obj.order.user.lastName,
      phoneNumber: obj.order.user.phoneNumber,
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
          address?: string;
          zipCode?: string;
          additionalInformation?: string;
          referencePoint?: string;
        };
      };
    }) => ({
      adress: obj.address?.address,
      zipCode: obj.address?.zipCode,
      additionalInformation: obj.address?.additionalInformation,
      referencePoint: obj.address?.referencePoint,
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
