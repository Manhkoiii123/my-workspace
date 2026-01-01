import { Controller, UseInterceptors } from '@nestjs/common';
import { TcpLoggingInterceptor } from '@common/interceptors/tcpLogging.interceptor';
import { MessagePattern } from '@nestjs/microservices';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message.enum';
import { RequestParam } from '@common/decorators/request-param.decorator';
import { Invoice } from '@common/schemas/invoice.schema';
import { Response } from '@common/interfaces/tcp/common/response.interface';
@Controller()
@UseInterceptors(TcpLoggingInterceptor)
export class InvoicePdfController {
  constructor(private readonly invoicePdfService: InvoicePdfService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.PDF_GENERATOR.CREATE_INVOICE_PDF)
  async createInvoicePdf(
    @RequestParam() data: Invoice
  ): Promise<Response<string>> {
    const buffer = await this.invoicePdfService.generateInvoicePdf(data);
    return Response.success<string>(Buffer.from(buffer).toString('base64'));
  }
}
