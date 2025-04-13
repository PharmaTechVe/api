import { ApiProperty } from '@nestjs/swagger';

export class NotificationDTO {
  @ApiProperty({ description: 'Mensaje de la notificación' })
  message: string;

  @ApiProperty({
    description: 'Indica si la notificación ha sido leída',
    default: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Identificador de la orden asociada a la notificación',
    required: false,
    nullable: true,
  })
  orderId?: string;
}
