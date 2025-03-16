import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserOTP } from './entities/user-otp.entity';
import { Profile } from './entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserOTP, Profile])],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
  controllers: [UserController],
})
export class UserModule {}
