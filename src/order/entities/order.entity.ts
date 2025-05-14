import { Branch } from 'src/branch/entities/branch.entity';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';
import { User } from 'src/user/entities/user.entity';
import { BaseModel, UUIDModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderDelivery, OrderDetailDelivery } from './order_delivery.entity';
import { PaymentMethod } from 'src/payments/entities/payment-information.entity';
import { PaymentConfirmation } from 'src/payments/entities/payment-confirmation.entity';

export enum OrderType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
}

export enum OrderStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  READY_FOR_PICKUP = 'ready_for_pickup',
  IN_PROGRESS = 'in_progress',
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

  @OneToMany(() => OrderDelivery, (orderDelivery) => orderDelivery.order)
  orderDeliveries: OrderDelivery[];

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'payment_method',
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @OneToMany(
    () => PaymentConfirmation,
    (paymentConfirmation) => paymentConfirmation.order,
  )
  paymentConfirmations: PaymentConfirmation[];
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

  @Column({ type: 'int', name: 'price' })
  price: number;

  @Column({ type: 'int', name: 'subtotal' })
  subtotal: number;

  @OneToMany(
    () => OrderDetailDelivery,
    (orderDeliveryDetail) => orderDeliveryDetail.orderDetail,
  )
  orderDetailDeliveries: OrderDetailDelivery[];
}
