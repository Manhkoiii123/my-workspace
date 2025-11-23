import { BadRequestException, Injectable } from '@nestjs/common';
import { PORT } from '@common/constants/common.constant';
@Injectable()
export class AppService {
  getData(): { message: string } {
    console.log(PORT);
    // throw new BadRequestException('Method not implemented.');
    return { message: 'Hello API bff' };
  }
}
