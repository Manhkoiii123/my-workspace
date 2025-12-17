import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserTcpRequest } from '@common/interfaces/tcp/user';
import { ERROR_CODE } from '@common/constants/enum/error-code.enum';
import { createUserRequestMapping } from '../mappers/user-request.mapper';
import { TCP_SERVICES } from '@common/configuration/tcp.config';
import { TcpClient } from '@common/interfaces/tcp/common/tcp-client.interface';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message.enum';
import { CreateKeyCloakUserTcpReq } from '@common/interfaces/tcp/authorizer';
import { firstValueFrom, map } from 'rxjs';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(TCP_SERVICES.AUTHORIZER_SERVICE)
    private readonly authorizerClient: TcpClient
  ) {}

  async create(data: CreateUserTcpRequest, processId: string) {
    const isExists = await this.userRepository.exists(data.email);

    if (isExists) {
      throw new BadRequestException(ERROR_CODE.USER_ALREADY_EXISTS);
    }
    const userId = await this.createKeyCloakUser(
      {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      processId
    );
    const input = createUserRequestMapping(data, userId);
    return this.userRepository.create(input);
  }

  createKeyCloakUser(data: CreateKeyCloakUserTcpReq, processId: string) {
    return firstValueFrom(
      this.authorizerClient
        .send<string>(TCP_REQUEST_MESSAGE.KEYCLOAK.CREATE_USER, {
          data,
          processId,
        })
        .pipe(map((data) => data.data))
    );
  }
}
