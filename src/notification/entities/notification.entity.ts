// src/notification/entities/notification.entity.ts

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from 'src/utils/entity';
import { Order } from 'src/order/entities/order.entity';

@Entity()
export class Notification extends BaseModel {
  @ManyToOne(() => Order, { eager: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;
}
