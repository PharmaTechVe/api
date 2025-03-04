import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { Presentation } from './presentation.entity';
import { BaseModel } from 'src/utils/entity';

@Entity('product_presentation')
export class ProductPresentation extends BaseModel {
  @ManyToOne(() => Product, (product) => product.presentations)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Presentation, (presentation) => presentation.presentations)
  @JoinColumn({ name: 'presentation_id' })
  presentation: Presentation;

  @Column({ type: 'int', name: 'price' })
  price: number;
}
