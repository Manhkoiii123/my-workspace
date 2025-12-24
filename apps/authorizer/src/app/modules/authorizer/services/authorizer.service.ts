import {
  AuthorizeResponse,
  LoginTcpRequest,
} from '@common/interfaces/tcp/authorizer';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { KeycloakHttpService } from '../../keycloak/services/keycloak-http.service';
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import jwksRsa, { JwksClient } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map } from 'rxjs';
import { User } from '@common/schemas/user.schema';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message.enum';
import { TCP_SERVICES } from '@common/configuration/tcp.config';
import { TcpClient } from '@common/interfaces/tcp/common/tcp-client.interface';
import { Role } from '@common/schemas/role.schema';
import { GRPC_SERVICES } from '@common/configuration/grpc.config';
import { ClientGrpc } from '@nestjs/microservices';
import { UserAccessService } from '@common/interfaces/grpc/user-access';

@Injectable()
export class AuthorizerService {
  private userAccessService: UserAccessService;
  private readonly logger = new Logger(AuthorizerService.name);
  private jwksClient: JwksClient;
  constructor(
    private readonly keycloakHttpService: KeycloakHttpService,
    private readonly configService: ConfigService,
    @Inject(TCP_SERVICES.USER_ACCESS_SERVICE)
    private readonly userAccessClient: TcpClient,
    @Inject(GRPC_SERVICES.USER_ACCESS_SERVICE)
    private readonly userAccessGrpcClient: ClientGrpc
  ) {
    const host = this.configService.get('KEYCLOAK_CONFIG.HOST');
    const realm = this.configService.get('KEYCLOAK_CONFIG.REALM');
    this.jwksClient = jwksRsa({
      jwksUri: `${host}/realms/${realm}/protocol/openid-connect/certs`,
      cache: true,
      rateLimit: true,
    });
  }

  onModuleInit() {
    this.userAccessService =
      this.userAccessGrpcClient.getService<UserAccessService>(
        'UserAccessService'
      );
  }
  async login(data: LoginTcpRequest) {
    const { password, username } = data;

    const { access_token: accessToken, refresh_token: refreshToken } =
      await this.keycloakHttpService.exchangeUserToken({ password, username });
    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyUserToken(
    token: string,
    processId: string
  ): Promise<AuthorizeResponse> {
    const decoded = jwt.decode(token, { complete: true }) as Jwt;
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new UnauthorizedException('Invalid token structure');
    }
    try {
      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();
      const payload = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
      }) as JwtPayload;

      this.logger.debug({
        payload,
      });

      const user = await this.validationUser(payload.sub, processId);

      return {
        valid: true,
        metadata: {
          jwt: payload,
          userId: user._id.toString(),
          user: user,
          permissions: (user.roles as unknown as Role[])
            .map((role) => role.permissions)
            .flat(),
        },
      };
    } catch (error) {
      this.logger.error({ error });
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async validationUser(userId: string, processId: string) {
    //tcp
    //  const user = await this.getUserByUserId(userId, processId);
    // grpc
    const user = await firstValueFrom(
      this.userAccessService.getByUserId({ userId, processId }).pipe(
        map((res) => {
          return res.data;
        })
      )
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  // tcp
  //get usser qua user id qua keycloak
  // private getUserByUserId(userId: string, processId: string) {
  //   return firstValueFrom(
  //     this.userAccessClient
  //       .send<User, string>(TCP_REQUEST_MESSAGE.USER.GET_BY_USER_ID, {
  //         data: userId,
  //         processId,
  //       })
  //       .pipe(map((data) => data.data))
  //   );
  // }
}
