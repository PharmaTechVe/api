import { City } from 'src/city/entities/city.entity';
import { User } from 'src/user/entities/user.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Branch extends BaseModel {
  @Column({ type: 'character varying', length: 255 })
  name: string;

  @Column({ type: 'character varying', length: 255 })
  address: string;

  @ManyToOne(() => City, (city) => city.branches, { eager: true })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ type: 'double precision', nullable: true })
  latitude: number;

  @Column({ type: 'double precision', nullable: true })
  longitude: number;

  @OneToMany(() => User, (user) => user.branch)
  users: User[];
}
