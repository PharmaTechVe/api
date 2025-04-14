import {
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { Notification } from '../entities/notification.entity';

@EventSubscriber()
export class NotificationSubscriber
  implements EntitySubscriberInterface<Order>
{
  listenTo() {
    return Order;
  }

  async afterUpdate(event: UpdateEvent<Order>) {
    const updatedOrder = event.entity as Order | undefined;
    console.log('Updated Order:', updatedOrder);
    if (!updatedOrder) return;

    const message = `The order ${updatedOrder.id} has been updated to ${updatedOrder.status}`;
    const notificationRepository = event.manager.getRepository(Notification);

    let notification = await notificationRepository.findOne({
      where: { order: { id: updatedOrder.id } },
    });

    if (notification) {
      notification.message = message;
      notification.isRead = false;
    } else {
      notification = notificationRepository.create({
        order: { id: updatedOrder.id } as Order,
        message,
        isRead: false,
      });
    }

    await notificationRepository.save(notification);
  }
}
