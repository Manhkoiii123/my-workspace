import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
export class RedisConfiguration {
  @IsString()
  @IsNotEmpty()
  HOST: string;

  @IsString()
  PORT: number;

  @IsNumber()
  TTL: number;

  constructor(data?: Partial<RedisConfiguration>) {
    this.HOST = data?.HOST || process.env['REDIS_HOST'] || '';
    this.PORT = data?.PORT || Number(process.env['REDIS_PORT']) || 6379;
    this.TTL = data?.TTL || Number(process.env['REDIS_TTL']) || 30 * 60000;
  }
}

export const RedisProvider = CacheModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const host = configService.get<string>('REDIS_CONFIG.HOST');
    const port = configService.get<number>('REDIS_CONFIG.PORT');
    const ttl = configService.get<number>('REDIS_CONFIG.TTL');
    return {
      stores: [createKeyv(`redis://${host}:${port}`)],
      ttl,
    };
  },
});
