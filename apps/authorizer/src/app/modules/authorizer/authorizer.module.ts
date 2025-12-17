import { Module } from '@nestjs/common';
import { AuthorizerService } from './services/authorizer.service';
import { AuthorizerController } from './controllers/authorizer.controller';
import { KeycloakModule } from '../keycloak/keycloak.module';

@Module({
  controllers: [AuthorizerController],
  providers: [AuthorizerService],
  exports: [],
  imports: [KeycloakModule],
})
export class AuthorizerModule {}
