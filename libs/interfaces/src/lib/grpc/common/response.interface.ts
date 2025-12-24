import { HTTP_MESSAGE } from '@common/constants/enum/http-message.enum';
import { HttpStatus } from '@nestjs/common';

export class Response<T> {
  code = HTTP_MESSAGE.OK;
  data?: T;
  error = '';
  statusCode?: number;

  constructor(partial: Partial<Response<T>>) {
    this.code = partial.code ?? HTTP_MESSAGE.OK;
    this.data = partial.data;
    this.error = partial.error ?? '';
    this.statusCode = partial.statusCode ?? HttpStatus.OK;
  }

  static success<T>(data: T) {
    return new Response<T>({
      code: HTTP_MESSAGE.OK,
      data,
      statusCode: HttpStatus.OK,
      error: '',
    });
  }
}

export type ResponseType<T> = Response<T>;
