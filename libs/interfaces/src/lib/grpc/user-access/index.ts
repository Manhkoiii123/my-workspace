import { User } from '@common/schemas/user.schema';
import { Response } from '../common/response.interface';
import { Observable } from 'rxjs';

export interface UserById {
  userId: string;
  processId: string;
}

export interface UserAccessService {
  getByUserId(data: UserById): Observable<Response<User>>;
}
