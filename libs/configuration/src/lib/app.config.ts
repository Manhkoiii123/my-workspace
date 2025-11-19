import { IsNumber } from 'class-validator';

export class AppConfiguration {
  @IsNumber()
  PORT: string;

  constructor() {
    this.PORT = process.env['PORT'] || '3000';
  }
}
