import { Module } from '@nestjs/common';
import { KeycloakController } from './controllers/keycloak.controller';
import { KeycloakHttpService } from './services/keycloak-http.service';

@Module({
  providers: [KeycloakHttpService],
  exports: [],
  controllers: [KeycloakController],
  imports: [],
})
export class KeycloakModule {}
