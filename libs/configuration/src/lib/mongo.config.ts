import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { Logger } from '@nestjs/common';
export class MongoConfiguration {
  @IsString()
  @IsNotEmpty()
  URL: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsNumber()
  @IsOptional()
  POOL_SIZE?: number;

  @IsNumber()
  @IsOptional()
  CONNECT_TIMEOUT_MS?: number;

  @IsNumber()
  @IsOptional()
  SOCKET_TIMEOUT_MS?: number;

  constructor(data?: Partial<MongoConfiguration>) {
    this.URL = data?.URL || process.env['MONGO_URI'] || '';
    this.DB_NAME =
      data?.DB_NAME || process.env['MONGO_DB_NAME'] || 'mydatabase';
    this.POOL_SIZE =
      data?.POOL_SIZE || Number(process.env['MONGO_POOL_SIZE'] || '10');
    this.CONNECT_TIMEOUT_MS =
      data?.CONNECT_TIMEOUT_MS ||
      Number(process.env['MONGO_CONNECT_TIMEOUT_MS'] || '15000');
    this.SOCKET_TIMEOUT_MS =
      data?.SOCKET_TIMEOUT_MS ||
      Number(process.env['MONGO_SOCKET_TIMEOUT_MS'] || '30000');
  }
}

export const MongoProvider = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGO_CONFIG.URL'),
    dbName: configService.get<string>('MONGO_CONFIG.DB_NAME'),
    maxPoolSize: configService.get<number>('MONGO_CONFIG.POOL_SIZE'),
    connectTimeoutMS: configService.get<number>(
      'MONGO_CONFIG.CONNECT_TIMEOUT_MS'
    ),
    socketTimeoutMS: configService.get<number>(
      'MONGO_CONFIG.SOCKET_TIMEOUT_MS'
    ),

    onConnectionCreate: (connection: Connection) => {
      connection.on('connected', () => {
        Logger.log('MongoDB connected successfully');
      });
      connection.on('open', () => {
        Logger.log('MongoDB connection opened');
      });
      connection.on('disconnected', () => {
        Logger.log('MongoDB connection disconnected');
      });
      connection.on('reconnected', () => {
        Logger.log('MongoDB connection reconnected');
      });
      connection.on('disconnecting', () => {
        Logger.log('MongoDB connection disconnecting');
      });
      return connection;
    },
  }),
});
