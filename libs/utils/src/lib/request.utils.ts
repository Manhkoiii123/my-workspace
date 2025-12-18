import { parseToken } from './string.utils';

export function getAccessToken(request: any, keepBearer = false) {
  const token = request.headers.authorization;
  return keepBearer ? token : parseToken(token);
}
