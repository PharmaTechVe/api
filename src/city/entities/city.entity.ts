import { Branch } from 'src/branch/entities/branch.entity';
import { State } from 'src/state/entities/state.entity';
import { UUIDModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('city')
export class City extends UUIDModel {
  @Column({ type: 'character varying', name: 'name' })
  name: string;

  @ManyToOne(() => State, (state) => state.city)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @OneToMany(() => Branch, (branch) => branch.city)
  branches: Branch[];
}
