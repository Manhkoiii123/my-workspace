import { Injectable } from '@nestjs/common';
import { PORT } from '@common/constants/constants.constant';
@Injectable()
export class AppService {
  getData(): { message: string } {
    console.log(PORT);
    return { message: 'Hello API bff' };
  }
}
