import { Controller } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { GrpcMethod } from '@nestjs/microservices';
import { Response } from '@common/interfaces/tcp/common/response.interface';
import { User } from '@common/schemas/user.schema';
import { UserById } from '@common/interfaces/grpc/user-access';

@Controller()
export class UserGrpcController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserAccessService', 'getByUserId')
  async getByUserId(payload: UserById): Promise<Response<User>> {
    const res = await this.userService.getUserByUserId(payload.userId);
    return Response.success(res);
  }
}
