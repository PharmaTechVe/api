import { Branch } from 'src/branch/entities/branch.entity';
import { State } from 'src/state/entities/state.entity';
import { UUIDModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserAddress } from 'src/user/entities/user-address.entity';

@Entity('city')
export class City extends UUIDModel {
  @Column({ type: 'character varying', name: 'name' })
  name: string;

  @ManyToOne(() => State, (state) => state.city, { eager: true })
  @JoinColumn({ name: 'state_id' })
  state: State;

  @OneToMany(() => Branch, (branch) => branch.city)
  branches: Branch[];

  @OneToMany(() => UserAddress, (userAdress) => userAdress.city)
  adresses: UserAddress[];
}
