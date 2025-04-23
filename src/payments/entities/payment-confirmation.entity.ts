import { BaseModel } from 'src/utils/entity';
import { Column, Entity } from 'typeorm';

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

  //order: Order;
}
