import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from 'src/utils/entity';
import { ProductPresentation } from './product-presentation.entity';
import { Branch } from 'src/branch/entities/branch.entity';

@Entity('lot')
export class Lot extends BaseModel {
  @ManyToOne(
    () => ProductPresentation,
    (productPresentation) => productPresentation.lot,
  )
  @JoinColumn({ name: 'product_presentation_id' })
  productPresentation: ProductPresentation;

  @Column({ type: 'int', name: 'quantity' })
  quantity: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'date', name: 'expiration_date' })
  expirationDate: Date;
}
