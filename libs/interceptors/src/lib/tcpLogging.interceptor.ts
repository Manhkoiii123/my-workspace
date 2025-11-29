import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map, Observable, tap } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { HTTP_MESSAGE } from '@common/constants/enum/http-message.enum';
@Injectable()
export class TcpLoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();
    const handler = context.getHandler();
    const handlerName = handler.name; // nó là cái getInvoice bên controller của invoice
    const args = context.getArgs();
    const param = args[0]; // lấy cái truyền vào (payload)
    const processId = param.processId;

    Logger.log(
      `TCP >> Start process id: '${processId}' method: '${handlerName}' at '${now}' param: ${JSON.stringify(
        param
      )}`
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        Logger.log(
          `TCP << End process id: '${processId}' method: '${handlerName}' after: ${duration}ms }`
        );
      }),
      catchError((error) => {
        const duration = Date.now() - now;
        Logger.error(
          `TCP !! Error process id: '${processId}' method: '${handlerName}' after: ${duration}ms } error: ${JSON.stringify(
            error
          )}`
        );
        throw new RpcException({
          code:
            error.status ||
            error.code ||
            error.error?.code ||
            HttpStatus.INTERNAL_SERVER_ERROR,

          message:
            error?.response?.message ||
            error.message ||
            HTTP_MESSAGE.INTERNAL_SERVER_ERROR,
        });
      })
    );
  }
}
