import { Column, Entity, OneToMany } from 'typeorm';
import { Manufacturer } from '../../products/entities/manufacturer.entity';
import { UUIDModel } from 'src/utils/entity';

@Entity('country')
export class Country extends UUIDModel {
  @Column({ type: 'character varying', name: 'name' })
  name: string;

  @OneToMany(() => Manufacturer, (manufacturer) => manufacturer.country)
  manufacturer: Manufacturer[];
}
