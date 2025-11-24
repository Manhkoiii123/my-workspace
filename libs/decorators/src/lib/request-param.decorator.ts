import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const RequestParam = createParamDecorator(
  (param: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!param) {
      return request.data;
    }
    return request.data[param];
  }
);
