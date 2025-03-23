import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserOTP } from './entities/user-otp.entity';
import { Profile } from './entities/profile.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Branch } from 'src/branch/entities/branch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserOTP, Profile, Branch]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
  controllers: [UserController],
})
export class UserModule {}
