// src/notification/notification.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find();
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.order', 'order')
      .where('order.user.id = :userId', { userId })
      .getMany();
  }

  async markAsRead(orderId: string): Promise<void> {
    const notifications = await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoin('notification.order', 'order')
      .where('order.id = :orderId', { orderId })
      .getMany();

    if (!notifications.length) {
      throw new NotFoundException(
        `No se encontraron notificaciones para la orden ${orderId}`,
      );
    }

    for (const notification of notifications) {
      notification.isRead = true;
      await this.notificationRepository.save(notification);
    }
  }
}
