import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Manufacturer } from './manufacturer.entity';

@Entity('country')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @OneToMany(() => Manufacturer, (manufacturer) => manufacturer.country)
  manufacturer: Manufacturer[];
}
