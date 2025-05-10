import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UpdateOrderStatusWsDTO } from './dto/order';
import { OrderService } from './order.service';
import { AuthGuardWs } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { RolesGuardWs } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';
import { WebsocketExceptionsFilter } from './ws.filters';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  connections: Socket[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly orderService: OrderService,
  ) {}

  handleConnection(client: Socket) {
    this.authService.validateUserWs(client);
  }

  handleDisconnect(client: Socket) {
    this.authService.disconnectUserWs(client);
  }

  @UseFilters(new WebsocketExceptionsFilter())
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @UseGuards(AuthGuardWs, RolesGuardWs)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @SubscribeMessage('updateOrder')
  update(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UpdateOrderStatusWsDTO,
  ) {
    this.orderService.findOneWithUser(data.id).then((order) => {
      this.orderService.getUserByOrderId(order.id).then((user) => {
        if (user.wsId) {
          client
            .to(user.wsId)
            .emit('orderUpdated', { orderId: order.id, status: data.status });
        }
      });
    });
  }
}
