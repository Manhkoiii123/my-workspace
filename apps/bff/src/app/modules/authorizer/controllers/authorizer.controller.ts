import { TCP_SERVICES } from '@common/configuration/tcp.config';
import { ResponseDto } from '@common/interfaces/gateway/response.interface';
import { TcpClient } from '@common/interfaces/tcp/common/tcp-client.interface';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  LoginRequestDto,
  LoginResponseDto,
} from '@common/interfaces/gateway/authorizer';
import { ProcessId } from '@common/decorators/processId.decorator';
import {
  LoginTcpRequest,
  LoginTcpResponse,
} from '@common/interfaces/tcp/authorizer';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message.enum';
import { map } from 'rxjs';

@ApiTags('authorizer')
@Controller('authorizer')
export class AuthorizerController {
  constructor(
    @Inject(TCP_SERVICES.AUTHORIZER_SERVICE)
    private readonly authorizerClient: TcpClient
  ) {}

  @Post('login')
  @ApiResponse({
    type: ResponseDto<LoginResponseDto>,
  })
  @ApiOperation({
    summary: 'Login with username and password',
  })
  login(@Body() data: LoginRequestDto, @ProcessId() processId: string) {
    return this.authorizerClient
      .send<LoginTcpResponse, LoginTcpRequest>(
        TCP_REQUEST_MESSAGE.AUTHORIZER.LOGIN,
        {
          data,
          processId,
        }
      )
      .pipe(map((data) => new ResponseDto(data)));
  }
}
