import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  connections: Socket[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly orderService: OrderService,
  ) {}

  handleConnection(client: Socket) {
    this.authService.validateUserWs(client);
    this.connections.push(client);
  }

  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @UseGuards(AuthGuardWs)
  @SubscribeMessage('updateOrder')
  update(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UpdateOrderStatusWsDTO,
  ) {
    this.orderService.update(data.id, data.status).then((order) => {
      client.to(this.connections[1].id).emit('order', order);
    });
  }
}
