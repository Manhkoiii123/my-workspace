import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseDto } from '@common/interfaces/gateway/response.interface';
import { firstValueFrom, map } from 'rxjs';
import { TcpClient } from '@common/interfaces/tcp/common/tcp-client.interface';
import { ProcessId } from '@common/decorators/processId.decorator';
@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('TCP_INVOICE_SERVICE') private readonly invoiceClient: TcpClient
  ) {}

  @Get()
  getData() {
    const res = this.appService.getData();
    return new ResponseDto({
      data: res,
    });
  }
  @Get('invoice')
  async getInvoice(@ProcessId() processId: string) {
    // const res = await firstValueFrom(
    return this.invoiceClient
      .send<string, number>('get_invoice', {
        processId,
        data: 1,
      })
      .pipe(map((data) => new ResponseDto<string>(data)));
    // );
    // return res;
  }
}
