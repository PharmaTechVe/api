import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async getAllNotifications() {
    return await this.notificationRepository.find({ relations: ['order'] });
  }
  async getUserNotifications(userId: string) {
    return await this.notificationRepository
      .createQueryBuilder('notification')
      .innerJoinAndSelect('notification.order', 'order')
      .where('order.user.id = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  async markAsReadAsCustomer(orderId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { order: { id: orderId, user: { id: userId } } },
      relations: ['order'],
    });
    if (!notification) {
      throw new ForbiddenException('Notification not found or no access');
    }
    notification.isRead = true;
    await this.notificationRepository.save(notification);
  }
}
