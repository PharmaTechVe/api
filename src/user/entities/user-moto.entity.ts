import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseModel } from 'src/utils/entity';

@Entity('user_moto')
export class UserMoto extends BaseModel {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'character varying', name: 'brand', nullable: true })
  brand: string;

  @Column({ type: 'character varying', name: 'model', nullable: true })
  model: string;

  @Column({ type: 'character varying', name: 'color', nullable: true })
  color: string;

  @Column({
    type: 'character varying',
    name: 'plate',
    nullable: true,
    unique: true,
  })
  plate: string;

  @Column({ type: 'character varying', name: 'license_url', nullable: true })
  licenseUrl: string;
}
