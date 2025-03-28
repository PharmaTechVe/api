import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProductPresentation } from '../entities/product-presentation.entity';
import { BaseModel } from 'src/utils/entity';

@Entity({ name: 'promo' })
export class Promo extends BaseModel {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int' })
  discount: number;

  @Column({ type: 'timestamp with time zone', name: 'expired_at' })
  expiredAt: Date;

  @ManyToOne(() => ProductPresentation, (presentation) => presentation.promos, {
    eager: true,
  })
  @JoinColumn({ name: 'product_presentation_id' })
  productPresentation: ProductPresentation;
}
