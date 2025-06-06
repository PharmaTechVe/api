import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserOTP } from './entities/user-otp.entity';
import { Profile } from './entities/profile.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Branch } from 'src/branch/entities/branch.entity';
import { UserAddress } from './entities/user-address.entity';
import { UserMoto } from './entities/user-moto.entity';
import { BranchModule } from 'src/branch/branch.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserOTP,
      Profile,
      Branch,
      UserAddress,
      UserMoto,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => BranchModule),
    EmailModule,
  ],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
  controllers: [UserController],
})
export class UserModule {}
