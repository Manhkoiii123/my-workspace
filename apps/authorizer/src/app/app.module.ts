import { Module } from '@nestjs/common';
import { CONFIGURATION, TConfiguration } from '../configuration';
import { ConfigModule } from '@nestjs/config';
import { KeycloakModule } from './modules/keycloak/keycloak.module';
import { AuthorizerModule } from './modules/authorizer/authorizer.module';
import { AuthorizerGrpcController } from './modules/authorizer/controllers/authorizer.grpc.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => CONFIGURATION],
    }),
    KeycloakModule,
    AuthorizerModule,
    AuthorizerGrpcController,
  ],
})
export class AppModule {
  static CONFIGURATION: TConfiguration = CONFIGURATION;
}
