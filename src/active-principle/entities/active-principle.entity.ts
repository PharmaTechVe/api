import { BaseModel } from 'src/utils/entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class ActivePrinciple extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
