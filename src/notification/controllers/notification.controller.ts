import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { AuthGuard, CustomRequest } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from 'src/user/entities/user.entity';
import { Observable } from 'rxjs';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification list',
  })
  async getNotifications(@Req() req: CustomRequest) {
    if (req.user.role === UserRole.ADMIN) {
      return await this.notificationService.getAllNotifications();
    } else {
      return await this.notificationService.getUserNotifications(req.user.id);
    }
  }
  @Post(':orderId/read')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification marked as read',
  })
  async markAsRead(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Req() req: CustomRequest,
  ): Promise<void> {
    await this.notificationService.markAsReadAsCustomer(orderId, req.user.id);
  }
  @Sse('stream')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SSE real-time notification flow' })
  @ApiResponse({
    status: 200,
    description: 'Notification SSE Event Stream',
  })
  streamNotifications(@Req() req: CustomRequest): Observable<MessageEvent> {
    return this.notificationService.subscribeToNotifications(req.user.id);
  }
}
