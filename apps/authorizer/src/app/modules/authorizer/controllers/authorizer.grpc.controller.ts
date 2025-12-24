import { Controller } from '@nestjs/common';
import { AuthorizerService } from '../services/authorizer.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  VerifyUserTokenRequest,
  VerifyUserTokenResponse,
} from '@common/interfaces/grpc/authorizer';
import { Response } from '@common/interfaces/grpc/common/response.interface';

@Controller()
export class AuthorizerGrpcController {
  constructor(private readonly authorizerService: AuthorizerService) {}

  // tham số 1 là tên service là cái bên file .proto định nghĩa
  // tham số 2 la ten method trong file .proto
  @GrpcMethod('AuthorizerService', 'verifyUserToken')
  async verifyUserToken(
    params: VerifyUserTokenRequest
  ): Promise<VerifyUserTokenResponse> {
    const result = await this.authorizerService.verifyUserToken(
      params.token,
      params.processId
    );
    return Response.success(result);
  }
}
