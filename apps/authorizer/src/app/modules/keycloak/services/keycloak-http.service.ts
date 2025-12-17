import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  CreateKeyCloakUserRequest,
  ExchangeClientTokenResponse,
  ExchangeUserTokenResponse,
} from '@common/interfaces/common';
import { LoginTcpRequest } from '@common/interfaces/tcp/authorizer';

@Injectable()
export class KeycloakHttpService {
  private readonly logger = new Logger(KeycloakHttpService.name);
  private readonly axiosInstance: AxiosInstance;
  private realm: string;
  private clientId: string;
  private clientSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.axiosInstance = axios.create({
      baseURL: this.configService.get('KEYCLOAK_CONFIG.HOST'),
    });
    this.realm = this.configService.get('KEYCLOAK_CONFIG.REALM');
    this.clientId = this.configService.get('KEYCLOAK_CONFIG.CLIENT_ID');
    this.clientSecret = this.configService.get('KEYCLOAK_CONFIG.CLIENT_SECRET');
  }

  // call tới endpoint login của keycloak
  async exchangeClientToken(): Promise<ExchangeClientTokenResponse> {
    const body = new URLSearchParams();
    body.append('client_id', this.clientId);
    body.append('client_secret', this.clientSecret);
    body.append('grant_type', 'client_credentials');
    body.append('scope', 'openid');
    const { data } = await this.axiosInstance.post(
      `/realms/${this.realm}/protocol/openid-connect/token`,
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return data;
  }

  async createUser(data: CreateKeyCloakUserRequest): Promise<string> {
    const { email, firstName, lastName, password } = data;
    const { access_token: accessToken } = await this.exchangeClientToken();
    const { headers } = await this.axiosInstance.post(
      `/admin/realms/${this.realm}/users`,
      {
        username: email,
        firstName,
        lastName,
        email,
        enabled: true,
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: false,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    // trả về dạng http://local/admin/realm/{realm}/users/{id}
    const userId = headers['location'].split('/').pop();
    if (!userId) {
      throw new InternalServerErrorException('Create user failed');
    }
    this.logger.debug(`Created user with id: ${userId}`);
    return userId;
  }

  async exchangeUserToken(
    params: LoginTcpRequest
  ): Promise<ExchangeUserTokenResponse> {
    const body = new URLSearchParams();
    body.append('client_id', this.clientId);
    body.append('client_secret', this.clientSecret);
    body.append('grant_type', 'password');
    body.append('scope', 'openid');
    body.append('password', params.password);
    body.append('username', params.username);
    const { data } = await this.axiosInstance.post(
      `/realms/${this.realm}/protocol/openid-connect/token`,
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return data;
  }
}
