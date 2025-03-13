import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendHelper } from './resend/resend.helper';

@Module({
  providers: [EmailService, ResendHelper],
  exports: [EmailService],
})
export class EmailModule {}
