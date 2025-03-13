import { Injectable } from '@nestjs/common';
import { ResendHelper } from './resend/resend.helper';
import { EmailOptions, EmailOptionsContent } from './email.helper';

@Injectable()
export class EmailService {
  constructor(private resend: ResendHelper) {}

  async sendEmail(
    options: EmailOptions & EmailOptionsContent,
  ): Promise<boolean> {
    return this.resend.sendEmail(options);
  }
}
