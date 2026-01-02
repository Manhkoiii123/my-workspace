import { Inject, Injectable } from '@nestjs/common';
import { TCP_SERVICES } from '@common/configuration/tcp.config';
import { TcpClient } from '@common/interfaces/tcp/common/tcp-client.interface';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message.enum';
import { InvoiceTcpResponse } from '@common/interfaces/tcp/invoice/invoice-response.interface';
import { InvoiceSendPayload } from '@common/interfaces/queue/invoice';
import { MailTemplateService } from '../../mail-template/services/mail-template.service';
import { MailService } from '../services/mail.service';
import { firstValueFrom, map } from 'rxjs';
@Injectable()
export class MailInvoiceService {
  constructor(
    @Inject(TCP_SERVICES.INVOICE_SERVICE)
    private readonly invoiceClient: TcpClient,
    private readonly mailTemplateService: MailTemplateService,
    private readonly mailService: MailService
  ) {}

  async sendInvoice(payload: InvoiceSendPayload) {
    const invoice = await this.getInvoiceById(payload.id);
    const html = await this.mailTemplateService.render('invoice', {
      clientName: invoice.client.name,
      senderName: 'Manh',
      invoiceCode: `#${invoice._id.toString()}`,
      paymentLink: payload.paymentLink,
    });

    await this.mailService.sendMail({
      html,
      subject: 'Invoice',
      to: invoice.client.email,
      attachments: [
        {
          filename: `invoice_${invoice._id.toString()}.pdf`,
          path: invoice.fileUrl,
        },
      ],
    });
  }

  private getInvoiceById(id: string) {
    return firstValueFrom(
      this.invoiceClient
        .send<InvoiceTcpResponse, string>(
          TCP_REQUEST_MESSAGE.INVOICE.GET_BY_ID,
          {
            data: id,
          }
        )
        .pipe(map((data) => data.data))
    );
  }
}
