import { BaseModel } from 'src/utils/entity';
import { Column, Entity } from 'typeorm';

export enum PaymentMethod {
  CARD = 'card',
  MOBILE_PAYMENT = 'mobile_payment',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

@Entity('payment_information')
export class PaymentInformation extends BaseModel {
  @Column({ type: 'character varying', name: 'bank' })
  bank: string;

  @Column({ type: 'character varying', name: 'account_type' })
  accountType: 'saving' | 'checking';

  @Column({ type: 'character varying', name: 'account' })
  account: string;

  @Column({ type: 'character varying', name: 'document_id' })
  documentId: string;

  @Column({ type: 'character varying', name: 'phone_number' })
  phoneNumber: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;
}
