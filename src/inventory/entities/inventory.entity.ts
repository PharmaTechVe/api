import { Branch } from 'src/branch/entities/branch.entity';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Inventory extends BaseModel {
  @Column({ name: 'stock_quantity', type: 'int', nullable: false })
  stockQuantity: number;

  @ManyToOne(
    () => ProductPresentation,
    (productPresentation) => productPresentation.inventories,
    { eager: true },
  )
  @JoinColumn({ name: 'product_presentation_id' })
  productPresentation: ProductPresentation;

  @ManyToOne(() => Branch, (branch) => branch.inventories, { eager: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
