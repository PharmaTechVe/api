import { BaseModel } from 'src/utils/entity';
import { Entity, Column, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import type { UserOTP } from './user-otp.entity';

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

  @Column({ type: 'character varying', name: 'phone_number' })
  phoneNumber: string;

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
}
