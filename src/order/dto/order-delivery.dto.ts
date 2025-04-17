import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Expose, Transform } from 'class-transformer';

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
  @ApiProperty({ description: 'Full name of the user' })
  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: { order?: { user?: { firstName?: string; lastName?: string } } };
    }) => {
      const user = obj.order?.user;
      if (user?.firstName && user?.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return undefined;
    },
  )
  userName?: string;

  @ApiProperty({ description: 'Phone number of the user', nullable: true })
  @Expose()
  @Transform(
    ({ obj }: { obj: { order?: { user?: { phoneNumber?: string } } } }) =>
      obj.order?.user?.phoneNumber,
  )
  userPhone?: string;

  // Delivery address information
  @ApiProperty({ description: 'Address street', nullable: true })
  @Expose()
  @Transform(
    ({ obj }: { obj: { adress?: { adress?: string } } }) => obj.adress?.adress,
  )
  address?: string;

  @ApiProperty({ description: 'Zip code', nullable: true })
  @Expose()
  @Transform(
    ({ obj }: { obj: { adress?: { zipCode?: string } } }) =>
      obj.adress?.zipCode,
  )
  zipCode?: string;

  @ApiProperty({
    description: 'Additional address information',
    nullable: true,
  })
  @Expose()
  @Transform(
    ({ obj }: { obj: { adress?: { additionalInformation?: string } } }) =>
      obj.adress?.additionalInformation,
  )
  additionalInformation?: string;

  @ApiProperty({ description: 'Reference point for delivery', nullable: true })
  @Expose()
  @Transform(
    ({ obj }: { obj: { adress?: { referencePoint?: string } } }) =>
      obj.adress?.referencePoint,
  )
  referencePoint?: string;
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
