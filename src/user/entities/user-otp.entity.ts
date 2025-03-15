import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { UUIDModel } from 'src/utils/entity';

@Entity()
export class UserOTP extends UUIDModel {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 6 })
  code: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;
}
