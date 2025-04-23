import { Entity, Column } from 'typeorm';
import { BaseModel } from 'src/utils/entity';

@Entity({ name: 'coupon' })
export class Coupon extends BaseModel {
  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'int' })
  discount: number;

  @Column({ name: 'min_purchase', type: 'int' })
  minPurchase: number;

  @Column({ name: 'max_uses', type: 'int' })
  maxUses: number;

  @Column({ name: 'expiration_date', type: 'timestamp without time zone' })
  expirationDate: Date;
}
