import { parseToken } from './string.utils';
import { MetadataKeys } from '@common/constants/common.constant';
import { AuthorizeResponse } from '@common/interfaces/tcp/authorizer';
export function getAccessToken(request: any, keepBearer = false) {
  const token = request.headers.authorization;
  return keepBearer ? token : parseToken(token);
}
export function setUserData(request: any, data?: AuthorizeResponse) {
  request[MetadataKeys.USER] = data;
}
