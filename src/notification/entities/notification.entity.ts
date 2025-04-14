import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from 'src/utils/entity';
import { Order } from 'src/order/entities/order.entity';

@Entity()
export class Notification extends BaseModel {
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;
}
