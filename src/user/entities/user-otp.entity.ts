import { Entity, Column, OneToOne, JoinColumn, Unique } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { UUIDModel } from 'src/utils/entity';
export enum OTPType {
  PASSWORD = 'password-recovery',
  EMAIL = 'email-validation',
}
@Entity()
@Unique('unique_otp_code_per_type', ['code', 'type'])
export class UserOTP extends UUIDModel {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'enum', enum: OTPType, nullable: true })
  type: OTPType;
}
