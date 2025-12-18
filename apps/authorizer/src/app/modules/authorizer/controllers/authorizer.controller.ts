import { TcpLoggingInterceptor } from '@common/interceptors/tcpLogging.interceptor';
import { Controller, UseInterceptors } from '@nestjs/common';
import { AuthorizerService } from '../services/authorizer.service';
import { MessagePattern } from '@nestjs/microservices';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message.enum';
import { RequestParam } from '@common/decorators/request-param.decorator';
import {
  AuthorizeResponse,
  LoginTcpRequest,
  LoginTcpResponse,
} from '@common/interfaces/tcp/authorizer';
import { Response } from '@common/interfaces/tcp/common/response.interface';
import { ProcessId } from '@common/decorators/processId.decorator';

@Controller()
@UseInterceptors(TcpLoggingInterceptor)
export class AuthorizerController {
  constructor(private readonly authorizerService: AuthorizerService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.AUTHORIZER.LOGIN)
  async login(@RequestParam() data: LoginTcpRequest) {
    const res = await this.authorizerService.login(data);
    return Response.success<LoginTcpResponse>(res);
  }

  @MessagePattern(TCP_REQUEST_MESSAGE.AUTHORIZER.VERIFY_USER_TOKEN)
  async verifyUserToken(
    @RequestParam() data: string,
    @ProcessId() processId: string
  ) {
    const res = await this.authorizerService.verifyUserToken(data);
    return Response.success<AuthorizeResponse>(res);
  }
}
