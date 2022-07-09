export default class User {
  constructor(
    public id: string | null,
    public username: string,
    public password: string,
    public email: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
