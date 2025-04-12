import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

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
