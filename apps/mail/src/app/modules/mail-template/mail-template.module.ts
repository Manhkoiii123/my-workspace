import { Module } from '@nestjs/common';
import { MailTemplateService } from './services/mail-template.service';

@Module({
  controllers: [],
  providers: [],
  exports: [MailTemplateService],
  imports: [MailTemplateService],
})
export class MailTemplateModule {}
