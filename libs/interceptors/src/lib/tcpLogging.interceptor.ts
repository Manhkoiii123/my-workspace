import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

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
      })
    );
  }
}
