import {
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { Order, OrderStatus } from 'src/order/entities/order.entity';
import { Notification } from '../entities/notification.entity';

@EventSubscriber()
export class NotificationSubscriber
  implements EntitySubscriberInterface<Order>
{
  listenTo() {
    return Order;
  }

  translateStatus(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.APPROVED:
        return 'aprobada';
      case OrderStatus.IN_PROGRESS:
        return 'en progreso';
      case OrderStatus.COMPLETED:
        return 'completada';
      case OrderStatus.CANCELED:
        return 'cancelada';
      case OrderStatus.REQUESTED:
        return 'solicitada';
      case OrderStatus.READY_FOR_PICKUP:
        return 'lista para recoger';
      default:
        return 'Desconocido';
    }
  }

  async afterUpdate(event: UpdateEvent<Order>) {
    const updatedOrder = event.entity as Order | undefined;
    if (!updatedOrder) return;

    const message = `
      La Orden #${updatedOrder.id.slice(0, 8)} ya está ${this.translateStatus(updatedOrder.status)}
    `;
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
