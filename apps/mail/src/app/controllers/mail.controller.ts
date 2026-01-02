import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

@Controller()
export class MailController {
  // emit nên nó là EventPattern, còn send thì nó sẽ là messagepattern
  @EventPattern('invoice-send')
  invoiceSendEvent(@Payload() Payload: any, @Ctx() context: KafkaContext) {
    // payload là cái gửi ở bên cái emit
  }
}
