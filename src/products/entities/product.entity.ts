import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Manufacturer } from './manufacturer.entity';
import { ProductImage } from './product-image.entity';
import { Category } from '../../category/entities/category.entity';
import { ProductPresentation } from './product-presentation.entity';
import { BaseModel } from 'src/utils/entity';

@Entity('product')
export class Product extends BaseModel {
  @Column({ type: 'character varying', name: 'name' })
  name: string;

  @Column({ type: 'character varying', name: 'generic_name' })
  genericName: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({ type: 'int', name: 'priority' })
  priority: number;

  @ManyToOne(() => Manufacturer, (manufacturer) => manufacturer.products)
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer: Manufacturer;

  @OneToMany(() => ProductImage, (productImage) => productImage.product)
  images: ProductImage[];

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
    (productPresentation) => productPresentation.product,
  )
  presentations: ProductPresentation[];
}
