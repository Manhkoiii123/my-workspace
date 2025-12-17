import { LoginTcpRequest } from '@common/interfaces/tcp/authorizer';
import { Injectable } from '@nestjs/common';
import { KeycloakHttpService } from '../../keycloak/services/keycloak-http.service';

@Injectable()
export class AuthorizerService {
  constructor(private readonly keycloakHttpService: KeycloakHttpService) {}
  async login(data: LoginTcpRequest) {
    const { password, username } = data;

    const { access_token: accessToken, refresh_token: refreshToken } =
      await this.keycloakHttpService.exchangeUserToken({ password, username });
    return {
      accessToken,
      refreshToken,
    };
  }
}
