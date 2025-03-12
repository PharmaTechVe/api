import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOTP } from 'src/otp-user/entities/user-otp.entity';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserOTP, User])],
  providers: [OtpService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
