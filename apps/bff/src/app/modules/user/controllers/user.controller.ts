import { TCP_SERVICES } from '@common/configuration/tcp.config';
import { ResponseDto } from '@common/interfaces/gateway/response.interface';
import { TcpClient } from '@common/interfaces/tcp/common/tcp-client.interface';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserRequestDto } from '@common/interfaces/gateway/user';
import { ProcessId } from '@common/decorators/processId.decorator';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message.enum';
import { CreateUserTcpRequest } from '@common/interfaces/tcp/user';
import { map } from 'rxjs';
import { Authorization } from '@common/decorators/authorizer.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    @Inject(TCP_SERVICES.USER_ACCESS_SERVICE)
    private readonly userAccessClient: TcpClient
  ) {}

  @Post()
  @ApiOkResponse({
    type: ResponseDto<string>,
  })
  @ApiOperation({ summary: 'Create new user' })
  @Authorization({ secured: false })
  async create(
    @Body() body: CreateUserRequestDto,
    @ProcessId() processId: string
  ) {
    return this.userAccessClient
      .send<string, CreateUserTcpRequest>(TCP_REQUEST_MESSAGE.USER.CREATE, {
        data: body,
        processId: processId,
      })
      .pipe(map((data) => new ResponseDto(data)));
  }
}
