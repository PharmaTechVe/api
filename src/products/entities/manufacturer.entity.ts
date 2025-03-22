import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { Country } from '../../country/entities/country.entity';
import { BaseModel } from 'src/utils/entity';

@Entity('manufacturer')
export class Manufacturer extends BaseModel {
  @Column({ type: 'character varying', name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'description' })
  description: string;

  @ManyToOne(() => Country, (country) => country.manufacturer, { eager: true })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @OneToMany(() => Product, (product) => product.manufacturer)
  products: Product[];
}
