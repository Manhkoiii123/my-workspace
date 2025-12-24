import { Module } from '@nestjs/common';
import { AuthorizerService } from './services/authorizer.service';
import { AuthorizerController } from './controllers/authorizer.controller';
import { KeycloakModule } from '../keycloak/keycloak.module';
import { ClientsModule } from '@nestjs/microservices';
import { TCP_SERVICES, TcpProvider } from '@common/configuration/tcp.config';
import { GRPC_SERVICES, GrpcProvider } from '@common/configuration/grpc.config';

@Module({
  controllers: [AuthorizerController],
  providers: [AuthorizerService],
  exports: [],
  imports: [
    KeycloakModule,
    ClientsModule.registerAsync([
      TcpProvider(TCP_SERVICES.USER_ACCESS_SERVICE),
      GrpcProvider(GRPC_SERVICES.USER_ACCESS_SERVICE),
    ]),
  ],
})
export class AuthorizerModule {}
