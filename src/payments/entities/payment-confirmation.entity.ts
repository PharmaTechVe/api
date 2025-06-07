import { Order } from 'src/order/entities/order.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('payment_confirmation')
export class PaymentConfirmation extends BaseModel {
  @Column({ type: 'character varying', name: 'bank' })
  bank: string;

  @Column({ type: 'character varying', name: 'reference' })
  reference: string;

  @Column({ type: 'character varying', name: 'document_id' })
  documentId: string;

  @Column({ type: 'character varying', name: 'phone_number' })
  phoneNumber: string;

  @OneToOne(() => Order, (order) => order.paymentConfirmation, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
