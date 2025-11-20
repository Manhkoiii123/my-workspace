import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getProcessId } from '@common/utils/string.utils';
import { MetadataKeys } from '@common/constants/common.constant';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, body, originalUrl } = req;

    const processId = getProcessId();
    const now = Date.now();
    (req as any)[MetadataKeys.PROCESS_ID] = processId;
    (req as any)[MetadataKeys.START_TIME] = startTime;

    Logger.log(
      `HTTP >> Start process id: '${processId}' method: '${method}' url: '${originalUrl}' at '${now}' body: ${JSON.stringify(
        body
      )}`
    );
    const originalSend = res.send.bind(res);
    const duration = Date.now() - startTime;

    res.send = function (body) {
      Logger.log(
        `HTTP << End process id: '${processId}' method: '${method}' url: '${originalUrl}' at '${now}' duration: ${duration}ms }`
      );
      return originalSend(body);
    };
    next();
  }
}
