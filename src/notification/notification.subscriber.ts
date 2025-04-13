// src/notification/notification.subscriber.ts
import {
  EventSubscriber,
  EntitySubscriberInterface,
  UpdateEvent,
} from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { Notification } from './entities/notification.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@EventSubscriber()
@Injectable()
export class NotificationSubscriber
  implements EntitySubscriberInterface<Order>
{
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  listenTo() {
    return Order;
  }

  async afterUpdate(event: UpdateEvent<Order>): Promise<void> {
    if (!event.entity) {
      return;
    }

    const order = Object.assign(new Order(), event.entity);

    const notification = new Notification();
    notification.order = order;
    notification.message = `La orden ha sido actualizada: Nuevo estado ${order.status}`;
    notification.isRead = false;

    await this.notificationRepository.save(notification);

    console.log('Notification created for order ID:', order.id);
  }
}
