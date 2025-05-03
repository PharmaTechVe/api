import { BaseModel } from 'src/utils/entity';
import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import type { UserOTP } from './user-otp.entity';
import { Profile } from './profile.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { UserAddress } from './user-address.entity';
import { Order } from 'src/order/entities/order.entity';
import { UserMoto } from './user-moto.entity';
import {
  OrderDelivery,
  OrderDetailDelivery,
} from 'src/order/entities/order_delivery.entity';

export enum UserRole {
  ADMIN = 'admin',
  BRANCH_ADMIN = 'branch_admin',
  CUSTOMER = 'customer',
  DELIVERY = 'delivery',
}

@Entity()
export class User extends BaseModel {
  @Column({ type: 'character varying', name: 'first_name' })
  firstName: string;

  @Column({ type: 'character varying', name: 'last_name' })
  lastName: string;

  @Exclude()
  @Column({ type: 'character varying' })
  password: string;

  @Column({ type: 'character varying', unique: true })
  email: string;

  @Column({ type: 'character varying', name: 'document_id', unique: true })
  documentId: string;

  @Column({ type: 'character varying', name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ type: 'boolean', default: false, name: 'is_validated' })
  isValidated: boolean;

  @Column({
    name: 'last_order_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastOrderDate: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @OneToOne('UserOTP', (userOTP: UserOTP) => userOTP.user, { eager: true })
  otp: UserOTP;

  @ManyToOne(() => Branch, (branch) => branch.users, { eager: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToOne(() => Profile, (profile: Profile) => profile.user, { eager: true })
  profile: Profile;

  @OneToMany(() => UserAddress, (userAdress) => userAdress.user)
  adresses: UserAddress[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => OrderDelivery, (orderDelivery) => orderDelivery.employee)
  orderDeliveries: OrderDelivery[];

  @OneToMany(
    () => OrderDetailDelivery,
    (orderDelivery) => orderDelivery.employee,
  )
  orderDetailDeliveries: OrderDetailDelivery[];

  @OneToOne(() => UserMoto, (userMoto: UserMoto) => userMoto.user, {
    eager: true,
  })
  userMoto: UserMoto;

  @Column({ type: 'character varying', name: 'ws_id', nullable: true })
  wsId: string | undefined;
}
