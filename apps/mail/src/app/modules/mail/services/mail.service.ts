import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { SendMailOptions } from '@common/interfaces/common/email.interface';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('MAIL_CONFIG.HOST'),
      port: parseInt(config.get('MAIL_CONFIG.PORT'), 10),
      secure: false,
      auth: {
        user: config.get('MAIL_CONFIG.USER'),
        pass: config.get('MAIL_CONFIG.PASS'),
      },
    });
  }
  async sendMail({
    html,
    subject,
    to,
    attachments,
    senderEmail,
    senderName,
    text,
  }: SendMailOptions) {
    const defaultName = this.config.get('MAIL_CONFIG.SENDER_NAME');
    const defaultEmail = this.config.get('MAIL_CONFIG.SENDER_EMAIL');
    const mailOptions = {
      from: `${senderName || defaultName} <${senderEmail || defaultEmail}>`,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, ''),
      attachments,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log('Message sent: %s', info.messageId);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
