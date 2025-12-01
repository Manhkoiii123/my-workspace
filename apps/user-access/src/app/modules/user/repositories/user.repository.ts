import { User, UserModel, UserModelName } from '@common/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserModelName) private readonly userModel: UserModel
  ) {}

  create(data: Partial<User>) {
    return this.userModel.create(data);
  }
  getById(id: string) {
    return this.userModel.findById(id).exec();
  }
  getByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }
  getByUserId(userId: string) {
    return this.userModel.findOne({ userId }).populate('roles').exec();
  }
  async exists(email: string) {
    const res = await this.userModel.exists({ email }).exec();
    return !!res;
  }
}
