import { KafkaService } from './kafka.service';
import { DynamicModule, Module } from '@nestjs/common';
import { QUEUE_SERVICE } from '@common/constants/enum/queue.enum';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { hostname } from 'os';
@Module({})
export class KafkaModule {
  static register(serviceName: QUEUE_SERVICE): DynamicModule {
    return {
      module: KafkaModule,
      global: true,
      imports: [
        ConfigModule,
        ClientsModule.registerAsync([
          {
            name: serviceName,
            inject: [ConfigService],
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              transport: Transport.KAFKA,
              options: {
                client: {
                  clientId: `${serviceName}-${hostname()}`,
                  brokers: [
                    configService.get('KAFKA_CONFIG.URL') || 'localhost:9092',
                  ],
                },
              },
            }),
          },
        ]),
      ],
      providers: [
        {
          provide: KafkaService,
          useFactory: (client) => new KafkaService(client),
          inject: [serviceName],
        },
      ],
      exports: [KafkaService],
    };
  }
}
