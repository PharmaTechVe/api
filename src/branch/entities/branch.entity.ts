import { City } from 'src/city/entities/city.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Order } from 'src/order/entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import {
  OrderDelivery,
  OrderDetailDelivery,
} from 'src/order/entities/order_delivery.entity';

@Entity()
export class Branch extends BaseModel {
  @Column({ type: 'character varying', length: 255 })
  name: string;

  @Column({ type: 'character varying', length: 255 })
  address: string;

  @ManyToOne(() => City, (city) => city.branches, { eager: true })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ type: 'double precision', nullable: true })
  latitude: number;

  @Column({ type: 'double precision', nullable: true })
  longitude: number;

  @OneToMany(() => User, (user) => user.branch)
  users: User[];

  @OneToMany(() => Inventory, (inventory) => inventory.branch)
  inventories: Inventory[];

  @OneToMany(() => Order, (order) => order.branch)
  orders: Order[];

  @OneToMany(() => OrderDelivery, (orderDelivery) => orderDelivery.branch)
  orderDeliveries: OrderDelivery[];

  @OneToMany(() => OrderDetailDelivery, (orderDelivery) => orderDelivery.branch)
  orderDetailDeliveries: OrderDetailDelivery[];
}
