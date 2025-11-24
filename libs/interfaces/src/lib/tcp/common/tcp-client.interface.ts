import { RequestType } from './request.interface';
import { ResponseType } from './response.interface';
import { Observable } from 'rxjs';
export interface TcpClient {
  send<TResult = any, TInput = any>(
    pattern: string,
    data: RequestType<TInput>
  ): Observable<ResponseType<TResult>>;

  emit<TResult = any, TInput = any>(
    pattern: string,
    data: RequestType<TInput>
  ): Observable<ResponseType<TResult>>;
}
