import { IsNumber } from 'class-validator';

export class AppConfiguration {
  @IsNumber()
  PORT: number;

  constructor() {
    this.PORT = Number(process.env['PORT']) || 3000;
  }
}
