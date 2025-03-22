import { Country } from 'src/country/entities/country.entity';
import { UUIDModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('state')
export class State extends UUIDModel {
  @Column({ type: 'character varying', name: 'name' })
  name: string;

  @ManyToOne(() => Country, (country) => country.state)
  @JoinColumn({ name: 'country_id' })
  country: Country;
}
