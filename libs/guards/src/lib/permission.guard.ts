import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Permissions } from '@common/decorators/permission.decorator';
import { PERMISSION } from '@common/constants/enum/role.enum';
import { MetadataKeys } from '@common/constants/common.constant';
import {
  AuthorizedMetadata,
  AuthorizeResponse,
} from '@common/interfaces/tcp/authorizer';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<PERMISSION[]>(
      Permissions,
      context.getHandler()
    );
    // KO YÊU CẦU PERMISSIONS
    if (!requiredPermissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    const user = request[MetadataKeys.USER] as AuthorizeResponse;
    console.log('🚀 ~ PermissionGuard ~ canActivate ~ user:', user);
    const userPermissions = user.metadata.permissions as PERMISSION[];
    const isvalid = requiredPermissions.every((permission) =>
      userPermissions?.includes(permission)
    );
    if (!isvalid) {
      throw new ForbiddenException('Permission deny');
    }
    return isvalid;
  }
}
