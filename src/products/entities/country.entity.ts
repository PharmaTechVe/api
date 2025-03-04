import { Column, Entity, OneToMany } from 'typeorm';
import { Manufacturer } from './manufacturer.entity';
import { UUIDModel } from 'src/utils/entity';

@Entity('country')
export class Country extends UUIDModel {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @OneToMany(() => Manufacturer, (manufacturer) => manufacturer.country)
  manufacturer: Manufacturer[];
}
