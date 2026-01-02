import { TCP_SERVICES, TcpProvider } from '@common/configuration/tcp.config';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookService } from './services/webhook.service';

@Module({
  imports: [
    ClientsModule.registerAsync([TcpProvider(TCP_SERVICES.INVOICE_SERVICE)]),
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [],
})
export class WebhookModule {}
