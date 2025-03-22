import { State } from 'src/state/entities/state.entity';
import { UUIDModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('city')
export class City extends UUIDModel {
  @Column({ type: 'character varying', name: 'name' })
  name: string;

  @ManyToOne(() => State, (state) => state.city)
  @JoinColumn({ name: 'state_id' })
  state: State;
}
