import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { MetadataKeys } from '@common/constants/common.constant';
import { getAccessToken, setUserData } from '@common/utils/request.utils';
import { TCP_SERVICES } from '@common/configuration/tcp.config';
import { TcpClient } from '@common/interfaces/tcp/common/tcp-client.interface';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message.enum';
import { AuthorizeResponse } from '@common/interfaces/tcp/authorizer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { GRPC_SERVICES } from '@common/configuration/grpc.config';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthorizerService } from '@common/interfaces/grpc/authorizer';
@Injectable()
export class UserGuard implements CanActivate {
  private readonly logger = new Logger(UserGuard.name);
  private authorizerService: AuthorizerService;
  constructor(
    private readonly reflector: Reflector,
    @Inject(TCP_SERVICES.AUTHORIZER_SERVICE)
    private readonly authorizerClient: TcpClient,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(GRPC_SERVICES.AUTHORIZER_SERVICE)
    private readonly grpcClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.authorizerService =
      this.grpcClient.getService<AuthorizerService>('AuthorizerService');
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authOptions = this.reflector.get<{ secured: boolean }>(
      MetadataKeys.SECURED,
      context.getHandler()
    );
    const req = context.switchToHttp().getRequest();
    // api public (ser = false)
    if (!authOptions?.secured) {
      return true;
    }
    return this.verifyToken(req);
  }

  // function verifytoken user

  private async verifyToken(request: any): Promise<boolean> {
    try {
      const token = getAccessToken(request);

      const cacheKey = this.generateTokenCacheKey(token);
      const processId = request[MetadataKeys.PROCESS_ID];

      const cacheData = await this.cacheManager.get<AuthorizeResponse>(
        cacheKey
      );

      if (cacheData) {
        setUserData(request, cacheData);
        return true;
      }

      // call tcp qua auth để verify token
      // tcp
      // const res = await this.verifyUserToken(token, processId);

      // rgpc
      const { data: res } = await firstValueFrom(
        this.authorizerService.verifyUserToken({
          token,
          processId,
        })
      );

      if (!res?.valid) {
        throw new UnauthorizedException("Token doesn't exist");
      }
      this.logger.debug(`set cache for key: ${cacheKey}`);
      setUserData(request, res);
      await this.cacheManager.set(cacheKey, res, 30 * 60 * 1000); // lưu cache 30 phút
      return true;
    } catch (error) {
      this.logger.error({ error });
      throw new UnauthorizedException("Token doesn't exist");
    }
  }

  // tcp
  // private async verifyUserToken(token: string, processId: string) {
  //   return firstValueFrom(
  //     this.authorizerClient
  //       .send<AuthorizeResponse, string>(
  //         TCP_REQUEST_MESSAGE.AUTHORIZER.VERIFY_USER_TOKEN,
  //         {
  //           data: token,
  //           processId,
  //         }
  //       )
  //       .pipe(map((data) => data.data))
  //   );
  // }

  generateTokenCacheKey(token: string): string {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    return `user-token:${hash}`;
  }
}
