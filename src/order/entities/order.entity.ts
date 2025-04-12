import { Branch } from 'src/branch/entities/branch.entity';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';
import { User } from 'src/user/entities/user.entity';
import { BaseModel, UUIDModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

export enum OrderType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
}

export enum OrderStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Entity()
export class Order extends BaseModel {
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Branch, (branch) => branch.orders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.REQUESTED })
  status: OrderStatus;

  @Column({ type: 'int', name: 'total_price' })
  totalPrice: number;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  details: OrderDetail[];
}

@Entity()
export class OrderDetail extends UUIDModel {
  @ManyToOne(() => Order, (order) => order.details, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(
    () => ProductPresentation,
    (productPresentation) => productPresentation.orders,
  )
  @JoinColumn({ name: 'product_presentation_id' })
  productPresentation: ProductPresentation;

  @Column({ type: 'int', name: 'quantity' })
  quantity: number;

  @Column({ type: 'int', name: 'subtotal' })
  subtotal: number;
}
