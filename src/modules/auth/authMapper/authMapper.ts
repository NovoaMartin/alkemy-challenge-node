import UserModel from '../../../models/UserModel';
import User from '../authEntity/User';

export default function fromModelToEntity(model:UserModel):User {
  return new User(
    model.id,
    model.username,
    model.password,
    model.email,
    model.createdAt,
    model.updatedAt,
  );
}
