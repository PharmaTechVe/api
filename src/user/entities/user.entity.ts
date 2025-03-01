import { BaseModel } from '../../utils/entity';
import { Entity, Column } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  BRANCH_ADMIN = 'branch_admin',
  CUSTOMER = 'customer',
  DELIVERY = 'delivery',
}

@Entity()
export class User extends BaseModel {
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'document_id', unique: true })
  documentId: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'last_order_date', type: 'time with time zone' })
  lastOrderDate: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;
}
