import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export abstract class UUIDModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

@Entity()
export abstract class BaseModel extends UUIDModel {
  @CreateDateColumn({ name: 'created_at', type: 'time with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'time with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'time with time zone' })
  deletedAt: Date;
}
