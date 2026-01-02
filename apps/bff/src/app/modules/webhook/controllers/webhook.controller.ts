import { HTTP_MESSAGE } from '@common/constants/enum/http-message.enum';
import { ProcessId } from '@common/decorators/processId.decorator';
import { ResponseDto } from '@common/interfaces/gateway/response.interface';
import {
  Controller,
  Header,
  Headers,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from '@common/interfaces/tcp/common/response.interface';
import { WebhookService } from '../services/webhook.service';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly stripeWebhookService: WebhookService) {}

  @Post('/stripe')
  @ApiOperation({ summary: 'stripe webhook' })
  @ApiOkResponse({
    type: ResponseDto<string>,
  })
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @ProcessId() processId: string
  ) {
    await this.stripeWebhookService.processWebhook({
      processId,
      rawBody: req.rawBody,
      signature,
    });

    return Response.success<string>(HTTP_MESSAGE.CREATED);
  }
}
