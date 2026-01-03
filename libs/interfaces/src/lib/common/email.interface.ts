export type MailAttachment = {
  filename: string;
  content?: Buffer | string;
  contentType?: string;
  path?: string;
};

export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  senderName?: string;
  senderEmail?: string;
  attachments?: MailAttachment[];
}
