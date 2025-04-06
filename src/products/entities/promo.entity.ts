import { Entity, Column, OneToMany } from 'typeorm';
import { BaseModel } from 'src/utils/entity';
import { ProductPresentation } from './product-presentation.entity';

@Entity({ name: 'promo' })
export class Promo extends BaseModel {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int' })
  discount: number;

  @Column({ type: 'timestamp with time zone', name: 'expired_at' })
  expiredAt: Date;

  @Column({ type: 'timestamp with time zone', name: 'start_at' })
  startAt: Date;

  @OneToMany(
    () => ProductPresentation,
    (productPresentation) => productPresentation.promo,
  )
  productPresentations: ProductPresentation[];
}
