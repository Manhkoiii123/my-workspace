import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseDto } from '@common/interfaces/gateway/response.interface';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('TCP_INVOICE_SERVICE') private readonly invoiceClient: ClientProxy
  ) {}

  @Get()
  getData() {
    const res = this.appService.getData();
    return new ResponseDto({
      data: res,
    });
  }
  @Get('invoice')
  async getInvoice() {
    const res = await firstValueFrom(
      this.invoiceClient.send<string, number>('get_invoice', 1)
    ); // 1 là id của invoice (đang có kiểu là number)
    // trả về 1 observable string
    return new ResponseDto({
      data: res,
    });
  }
}
