import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Manufacturer } from './manufacturer.entity';
import { Lot } from './lot.entity';
import { ProductImage } from './product.image.entity';
import { Category } from './category.entity';
import { ProductPresentation } from './product.presentation.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  generic_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  priority: number;

  @ManyToOne(() => Manufacturer, (manufacturer) => manufacturer.products)
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer_id: Manufacturer;

  @OneToMany(() => ProductImage, (productImage) => productImage.product_id)
  images: ProductImage[];

  @OneToMany(() => Lot, (lot) => lot.product_id)
  lot: Lot[];

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'product_category',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  @OneToMany(
    () => ProductPresentation,
    (productPresentation) => productPresentation.product_id,
  )
  presentations: ProductPresentation[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
