import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { BaseModel } from 'src/utils/entity';

@Entity('product_image')
export class ProductImage extends BaseModel {
  @ManyToOne(() => Product, (product) => product.images)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'character varying', name: 'url' })
  url: string;
}
