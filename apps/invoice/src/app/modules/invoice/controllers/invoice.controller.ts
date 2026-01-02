import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TcpLoggingInterceptor } from '@common/interceptors/tcpLogging.interceptor';
import { Response } from '@common/interfaces/tcp/common/response.interface';
import { RequestParam } from '@common/decorators/request-param.decorator';
import { ProcessId } from '@common/decorators/processId.decorator';
import { InvoiceService } from '../services/invoice.service';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message.enum';
import {
  CreateInvoiceTcpRequest,
  InvoiceTcpResponse,
  SendInvoiceTcpReq,
} from '@common/interfaces/tcp/invoice';
import { HTTP_MESSAGE } from '@common/constants/enum/http-message.enum';
@Controller()
@UseInterceptors(TcpLoggingInterceptor)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.INVOICE.CREATE)
  async create(
    @RequestParam() params: CreateInvoiceTcpRequest,
    @ProcessId() processId: string
  ): Promise<Response<InvoiceTcpResponse>> {
    const res = await this.invoiceService.create(params);
    return Response.success<InvoiceTcpResponse>(res);
  }

  @MessagePattern(TCP_REQUEST_MESSAGE.INVOICE.SEND)
  async sendById(
    @RequestParam() params: SendInvoiceTcpReq,
    @ProcessId() processId: string
  ): Promise<Response<string>> {
    const res = await this.invoiceService.sendById(params, processId);
    return Response.success<string>(res);
  }
  @MessagePattern(TCP_REQUEST_MESSAGE.INVOICE.UPDATE_INVOICE_PAID)
  async updateInvoicePaid(
    @RequestParam() invoiceId: string
  ): Promise<Response<string>> {
    const res = await this.invoiceService.updateInvoicePaid(invoiceId);
    return Response.success<string>(HTTP_MESSAGE.UPDATED);
  }
}
