import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { UUIDModel } from 'src/utils/entity';
import { User } from './user.entity';

export enum UserGender {
  MALE = 'm',
  FEMALE = 'f',
}

@Entity()
export class UserProfile extends UUIDModel {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'character varying' })
  profilePicture: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ type: 'enum', enum: UserGender })
  gender: UserGender;
}
