import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { MetadataKeys } from '@common/constants/common.constant';
import { AuthorizeResponse } from '@common/interfaces/tcp/authorizer';
export const UserData = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userData = request[MetadataKeys.USER] as AuthorizeResponse;
    if (!userData) {
      throw new UnauthorizedException('User data not found');
    }
    return userData?.metadata;
  }
);
