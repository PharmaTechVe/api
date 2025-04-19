import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseModel } from 'src/utils/entity';
import { UserAddress } from 'src/user/entities/user-address.entity';
import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { Order, OrderDetail } from './order.entity';

@Entity('order_delivery')
export class OrderDelivery extends BaseModel {
  @ManyToOne(() => Order, (order) => order.orderDeliveries)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => UserAddress, (adress) => adress.orderDeliveries)
  @JoinColumn({ name: 'address_id' })
  address: UserAddress;

  @ManyToOne(() => User, (employee) => employee.orderDeliveries, {
    nullable: true,
  })
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ type: 'timestamp with time zone', name: 'estimated_time' })
  estimatedTime: Date;

  @Column({ type: 'varchar', name: 'delivery_status' })
  deliveryStatus: string;

  @ManyToOne(() => Branch, (branch) => branch.orderDeliveries)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}

@Entity('order_detail_delivery')
export class OrderDetailDelivery extends BaseModel {
  @ManyToOne(
    () => OrderDetail,
    (orderDetail) => orderDetail.orderDetailDeliveries,
  )
  @JoinColumn({ name: 'order_detail_id' })
  orderDetail: OrderDetail;

  @ManyToOne(() => User, (employee) => employee.orderDetailDeliveries, {
    nullable: true,
  })
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @ManyToOne(() => Branch, (branch) => branch.orderDetailDeliveries)
  @JoinColumn({ name: 'from_branch_id' })
  branch: Branch;

  @Column({ type: 'timestamp with time zone', name: 'estimated_time' })
  estimatedTime: Date;

  @Column({ type: 'varchar', name: 'delivery_status' })
  deliveryStatus: string;
}
