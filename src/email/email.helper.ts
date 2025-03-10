export type Recipient = {
  name: string;
  email: string;
};

export type EmailOptions = {
  subject: string;
  recipients: Recipient[];
};

export type EmailOptionsContent = {
  text?: string;
  html?: string;
};

export interface EmailHelper {
  apiKey: string;

  sendEmail(options: EmailOptions & EmailOptionsContent): boolean;

  sendEmailTemplate(
    options: EmailOptions,
    template: string,
    args: object,
  ): boolean;
}
