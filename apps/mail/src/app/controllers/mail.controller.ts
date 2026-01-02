import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

import { MailService } from '../modules/mail/services/mail.service';
@Controller()
export class MailController {
  constructor(private readonly mailservice: MailService) {}
  // emit nên nó là EventPattern, còn send thì nó sẽ là messagepattern
  @EventPattern('invoice-send')
  invoiceSendEvent(
    @Payload() payload: { invoiceId: string; clientEmail: string },
    @Ctx() context: KafkaContext
  ) {
    // payload là cái gửi ở bên cái emit
    this.mailservice.sendMail({
      subject: 'Invoice',
      to: payload.clientEmail,
      text: `Invoice: ${payload.invoiceId}`,
    });
  }
}
