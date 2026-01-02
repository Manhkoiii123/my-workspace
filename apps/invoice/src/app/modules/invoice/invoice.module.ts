import { MongoProvider } from '@common/configuration/mongo.config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceDestination } from '@common/schemas/invoice.schema';
import { InvoiceController } from './controllers/invoice.controller';
import { InvoiceService } from './services/invoice.service';
import { InvoiceRepository } from './repositories/invoice.repository';
import { TCP_SERVICES, TcpProvider } from '@common/configuration/tcp.config';
import { PaymentModule } from '../payment/payment.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QUEUE_SERVICE } from '@common/constants/enum/queue.enum';
import { KafkaModule } from '@common/kafka/kafka.module';

@Module({
  imports: [
    MongoProvider,
    MongooseModule.forFeature([InvoiceDestination]),
    ClientsModule.registerAsync([
      TcpProvider(TCP_SERVICES.PDF_GENERATOR_SERVICE),
      TcpProvider(TCP_SERVICES.MEDIA_SERVICE),
    ]),
    PaymentModule,
    KafkaModule.register(QUEUE_SERVICE.INVOICE),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository],
})
export class InvoiceModule {}
