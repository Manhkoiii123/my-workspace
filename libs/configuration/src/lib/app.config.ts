export class AppConfiguration {
  PORT: string;

  constructor() {
    this.PORT = process.env['PORT'] || '3000';
  }
}
