import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { City } from 'src/city/entities/city.entity';
import { BaseModel } from 'src/utils/entity';

@Entity('user_address')
export class UserAdress extends BaseModel {
  @ManyToOne(() => User, (user) => user.adresses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => City, (city) => city.adresses)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ type: 'character varying', name: 'adress' })
  adress: string;

  @Column({ type: 'character varying', name: 'zip_code', nullable: true })
  zipCode: string;

  @Column({ type: 'float', name: 'latitude', nullable: true })
  latitude: number;

  @Column({ type: 'float', name: 'longitude', nullable: true })
  longitude: number;

  @Column({
    type: 'character varying',
    length: 255,
    name: 'additional_information',
    nullable: true,
  })
  additionalInformation?: string;

  @Column({
    type: 'character varying',
    length: 255,
    name: 'reference_point',
    nullable: true,
  })
  referencePoint?: string;
}
