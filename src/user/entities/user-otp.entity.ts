import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { UUIDModel } from 'src/utils/entity';

@Entity()
@Index('unique_otp_code_per_type', ['code', 'type'], { unique: true })
export class UserOTP extends UUIDModel {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 6 })
  code: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;
  @Column({ type: 'enum', enum: ['password-recovery', 'email-validation'] })
  type: 'password-recovery' | 'email-validation';
}
