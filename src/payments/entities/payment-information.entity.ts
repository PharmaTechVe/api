import { BaseModel } from 'src/utils/entity';

export enum PaymentMethod {
  CARD = 'card',
  MOBILE_PAYMENT = 'mobile_payment',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

export class PaymentInformation extends BaseModel {
  bank: string;
  accountType: 'saving' | 'checking';
  account: string;
  documentId: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod; // enum de arriba
}
