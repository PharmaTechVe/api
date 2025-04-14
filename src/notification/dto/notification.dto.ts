import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class NotificationDTO {
  @ApiProperty({ description: 'Notification message' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Indicates if the notification has been read',
    default: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  isRead: boolean;

  @ApiProperty({
    description: 'Identifier of the order associated with the notification',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;
}
