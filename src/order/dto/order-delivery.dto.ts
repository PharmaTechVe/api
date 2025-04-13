import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';

export class OrderDeliveryDTO {
  @ApiProperty({ description: 'Unique identifier of the delivery' })
  id: string;

  @ApiProperty({ description: 'Id of the associated order' })
  orderId: string;

  @ApiProperty({
    description: 'Delivery status (e.g., pending, delivered, etc.)',
  })
  deliveryStatus: string;

  @ApiProperty({ description: 'Estimated time for delivery' })
  @IsDateString()
  estimatedTime: Date;

  @ApiProperty({
    description: 'Id of the branch associated with the delivery',
    nullable: true,
  })
  branchId: string | null;

  @ApiProperty({
    description: 'Id of the employee ("motorizado") assigned to the delivery',
    nullable: true,
  })
  employeeId: string | null;

  // User contact information (extracted from the order)
  @ApiProperty({ description: 'Full name of the user' })
  userName?: string;

  @ApiProperty({ description: 'Phone number of the user', nullable: true })
  userPhone?: string;

  // Delivery address information
  @ApiProperty({ description: 'Address street', nullable: true })
  address?: string;
  @ApiProperty({ description: 'Zip code', nullable: true })
  zipCode?: string;
  @ApiProperty({
    description: 'Additional address information',
    nullable: true,
  })
  additionalInformation?: string;
  @ApiProperty({ description: 'Reference point for delivery', nullable: true })
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
  @IsBoolean()
  reject?: boolean;
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
