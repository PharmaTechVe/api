// src/notification/notification.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserOrAdminGuard } from 'src/auth/user-or-admin.guard';
import { plainToInstance } from 'class-transformer';
import { NotificationDTO } from './dto/notification.dto';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar notificaciones para un usuario (admin o mismo usuario)',
  })
  @ApiOkResponse({
    description: 'Listado de notificaciones retornado con éxito',
    type: [NotificationDTO],
  })
  @UseGuards(AuthGuard, UserOrAdminGuard)
  async getNotifications(
    @Param('userId') userId: string,
  ): Promise<NotificationDTO[]> {
    const notifications = await this.notificationService.findByUser(userId);
    return notifications.map((notification) =>
      plainToInstance(NotificationDTO, {
        id: notification.id,
        message: notification.message,
        isRead: notification.isRead,
        orderId: notification.order ? notification.order.id : null,
      }),
    );
  }

  @Post(':orderId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar notificaciones como leídas para una orden específica',
  })
  @ApiResponse({
    description: 'Notificaciones marcadas como leídas para la orden indicada',
  })
  @UseGuards(AuthGuard, UserOrAdminGuard)
  async markNotificationAsRead(@Param('orderId') orderId: string) {
    await this.notificationService.markAsRead(orderId);
    return {
      message: `Notificaciones marcadas como leídas para la orden ${orderId}`,
    };
  }
}
