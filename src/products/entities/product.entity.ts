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
  manufacturer_id: Manufacturer;

  @OneToMany(() => ProductImage, (productImage) => productImage.product)
  images: ProductImage[];

  @ManyToOne(() => Lot, (lot) => lot.products)
  lot: Lot;

  @ManyToMany(() => Category)
  @JoinTable({ name: 'product_category' })
  categories: Category[];

  @OneToMany(
    () => ProductPresentation,
    (productPresentation) => productPresentation.product,
  )
  presentations: ProductPresentation[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
