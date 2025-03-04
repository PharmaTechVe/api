import { Column, Entity, OneToMany } from 'typeorm';
import { ProductPresentation } from './product-presentation.entity';
import { BaseModel } from 'src/utils/entity';

@Entity('presentation')
export class Presentation extends BaseModel {
  @Column({ type: 'character varying', name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'description' })
  description: string;

  @Column({ type: 'int', name: 'quantity' })
  quantity: number;

  @Column({ type: 'character varying', name: 'measurement_unit' })
  measurementUnit: string;

  @OneToMany(
    () => ProductPresentation,
    (productPresentation) => productPresentation.presentation,
  )
  presentations: ProductPresentation[];
}
