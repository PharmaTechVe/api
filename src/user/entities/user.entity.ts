import { BaseModel } from 'src/utils/entity';
import { Entity, Column } from 'typeorm';

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

  @Column({ type: 'character varying' })
  password: string;

  @Column({ type: 'character varying', unique: true })
  email: string;

  @Column({ type: 'character varying', name: 'document_id', unique: true })
  documentId: string;

  @Column({ type: 'character varying', name: 'phone_number' })
  phoneNumber: string;

  @Column({ type: 'boolean', default: false })
  isValidated: boolean;

  @Column({
    name: 'last_order_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastOrderDate: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;
}
