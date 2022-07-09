import { v4 } from 'uuid';
import UserModel from '../../../models/UserModel';
import fromModelToEntity from '../authMapper/authMapper';
import User from '../authEntity/User';
import UserNotFoundException from '../exception/UserNotFoundException';

export default class AuthRepository {
  constructor(private userModel: typeof UserModel) {}

  public async getByUsername(username: string): Promise<User> {
    const result = await this.userModel.findOne({
      where: {
        username,
      },
    });

    if (!result) {
      throw new UserNotFoundException(`User with username ${username} not found`);
    }
    return fromModelToEntity(result);
  }

  public async save(user: Partial<User>): Promise<User> {
    const isNewRecord = !user.id;
    if (isNewRecord) {
      // eslint-disable-next-line no-param-reassign
      user.id = v4();
    }
    const instance = this.userModel.build(user, { isNewRecord });
    const result = await instance.save();
    return fromModelToEntity(result);
  }
}
