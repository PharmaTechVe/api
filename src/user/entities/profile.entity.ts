import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { UUIDModel } from 'src/utils/entity';
import { User } from './user.entity';

export enum UserGender {
  MALE = 'm',
  FEMALE = 'f',
}

@Entity()
export class Profile extends UUIDModel {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', name: 'profile_picture', nullable: true })
  profilePicture: string;

  @Column({ type: 'date', name: 'birth_date' })
  birthDate: Date;

  @Column({ type: 'enum', enum: UserGender, nullable: true })
  gender: UserGender;
}
