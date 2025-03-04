import { UUIDModel } from 'src/utils/entity';
import { Column, Entity } from 'typeorm';

@Entity('category')
export class Category extends UUIDModel {
  @Column({ type: 'character varying', name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'description' })
  description: string;
}
