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
import { OrderService } from './services/order.service';
import { AuthGuardWs } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { RolesGuardWs } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';
import { WebsocketExceptionsFilter } from './ws.filters';
import {
  UpdateCoordinatesWsDTO,
  UpdateDeliveryWsDTO,
} from './dto/order-delivery.dto';
import { OrderDeliveryService } from './services/order-delivery.controller';

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
    private readonly orderDeliveryService: OrderDeliveryService,
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
    this.orderService
      .findOneWithUser(data.id)
      .then((order) => {
        this.orderService
          .getUserByOrderId(order.id)
          .then((user) => {
            if (user.wsId) {
              client.to(user.wsId).emit('orderUpdated', {
                orderId: order.id,
                status: data.status,
              });
            }
          })
          .catch((error) => {
            client.to(client.id).emit('error', error);
          });
      })
      .catch((error) => {
        {
          client.to(client.id).emit('error', error);
        }
      });
  }

  @UseFilters(new WebsocketExceptionsFilter())
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @UseGuards(AuthGuardWs, RolesGuardWs)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @SubscribeMessage('updateDelivery')
  updateDelivery(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UpdateDeliveryWsDTO,
  ) {
    this.orderDeliveryService
      .findOne(data.id)
      .then((delivery) => {
        this.orderService
          .getUserByOrderId(delivery.order.id)
          .then((user) => {
            if (user.wsId) {
              client.to(user.wsId).emit('deliveryUpdated', {
                orderDeliveryId: delivery.id,
                status: data.deliveryStatus,
                employeeId: delivery.employee.id,
              });
            }
          })
          .catch((error) => {
            client.to(client.id).emit('error', error);
          });
      })
      .catch((error) => {
        client.to(client.id).emit('error', error);
      });
  }

  @UseFilters(new WebsocketExceptionsFilter())
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @UseGuards(AuthGuardWs, RolesGuardWs)
  @Roles(UserRole.DELIVERY)
  @SubscribeMessage('updateCoordinates')
  updateCoordinates(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UpdateCoordinatesWsDTO,
  ) {
    this.orderService
      .findOneWithUser(data.orderId)
      .then((order) => {
        if (order.user.wsId) {
          client.to(order.user.wsId).emit('coordinatesUpdated', {
            latitude: data.latitude,
            longitude: data.longitude,
          });
        }
      })
      .catch((error) => {
        client.to(client.id).emit('error', error);
      });
  }
}
