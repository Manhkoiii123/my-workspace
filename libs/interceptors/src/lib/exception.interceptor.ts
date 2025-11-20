import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, map } from 'rxjs';
import { Request } from 'express';
import { MetadataKeys } from '@common/constants/common.constant';
import { ResponseDto } from '@common/interfaces/gateway/response.interface';
import { HTTP_MESSAGE } from '@common/constants/enum/http-message.enum';

export class exceptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(exceptionInterceptor.name);
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const req: Request & {
      [MetadataKeys.PROCESS_ID]: string;
      [MetadataKeys.START_TIME]: number;
    } = ctx.getRequest();
    const processId = req[MetadataKeys.PROCESS_ID];
    const startTime = req[MetadataKeys.START_TIME];
    return next.handle().pipe(
      map((data: ResponseDto<unknown>) => {
        const duration = Date.now() - startTime;
        data.processId = processId;
        data.duration = `${duration}ms`;
        return data;
      }),
      catchError((error) => {
        this.logger.error({ error });
        const duration = Date.now() - startTime;
        const message =
          error.response?.message ||
          error.message ||
          error ||
          HTTP_MESSAGE.INTERNAL_SERVER_ERROR;
        const code =
          error?.code ||
          error.statusCode ||
          error?.response?.statusCode ||
          HttpStatus.INTERNAL_SERVER_ERROR;

        throw new HttpException(
          new ResponseDto({
            data: null,
            message,
            statusCode: code,
            duration: `${duration}ms`,
            processId,
          }),
          code
        );
      })
    );
  }
}
