import { Order } from 'src/order/entities/order.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

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

  @ManyToOne(() => Order, (order) => order.paymentConfirmations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
