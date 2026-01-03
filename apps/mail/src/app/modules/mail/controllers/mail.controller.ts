import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

import { MailService } from '../services/mail.service';
import { InvoiceSendPayload } from '@common/interfaces/queue/invoice';
import { MailInvoiceService } from '../services/mail-invoice.service';
@Controller()
export class MailController {
  constructor(private readonly mailInvoiceService: MailInvoiceService) {}
  // emit nên nó là EventPattern, còn send thì nó sẽ là messagepattern
  @EventPattern('invoice-send')
  // payload là cái gửi lên ở cái emit
  async invoiceSendEvent(@Payload() payload: InvoiceSendPayload) {
    await this.mailInvoiceService.sendInvoice(payload);
  }
}
