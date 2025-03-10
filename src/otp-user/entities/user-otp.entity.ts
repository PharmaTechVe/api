import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class UserOTP {
  @PrimaryGeneratedColumn()
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ length: 6 })
  code: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
