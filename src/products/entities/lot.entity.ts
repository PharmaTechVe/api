import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { BaseModel } from 'src/utils/entity';

@Entity('lot')
export class Lot extends BaseModel {
  @ManyToOne(() => Product, (product) => product.lot)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'date', name: 'expiration_date' })
  expirationDate: Date;
}
