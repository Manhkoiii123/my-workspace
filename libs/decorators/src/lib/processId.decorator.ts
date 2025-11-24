import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { MetadataKeys } from '@common/constants/common.constant';
import { getProcessId } from '@common/utils/string.utils';
export const ProcessId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[MetadataKeys.PROCESS_ID] || getProcessId();
  }
);
