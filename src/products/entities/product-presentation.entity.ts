import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { Presentation } from './presentation.entity';
import { BaseModel } from 'src/utils/entity';
import { Lot } from './lot.entity';
import { Promo } from '../entities/promo.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';

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

  @OneToMany(() => Lot, (lot) => lot.productPresentation)
  lot: Lot[];

  @OneToMany(() => Promo, (promo) => promo.productPresentation)
  promos: Promo[];

  @OneToMany(() => Inventory, (inventory) => inventory.productPresentation)
  inventories: Inventory[];
}
