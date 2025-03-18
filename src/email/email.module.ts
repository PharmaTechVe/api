import { Module, forwardRef } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendHelper } from './resend/resend.helper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailController } from './email.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  providers: [EmailService, ResendHelper],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
