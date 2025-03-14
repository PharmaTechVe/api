import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from 'src/utils/entity';
import { ProductPresentation } from './product-presentation.entity';

@Entity('lot')
export class Lot extends BaseModel {
  @ManyToOne(
    () => ProductPresentation,
    (productPresentation) => productPresentation.lot,
  )
  @JoinColumn({ name: 'product_presentation_id' })
  productPresentation: ProductPresentation;

  @Column({ type: 'date', name: 'expiration_date' })
  expirationDate: Date;
}
