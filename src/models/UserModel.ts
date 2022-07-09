import {
  Column, DataType, Model, PrimaryKey, Table, Unique,
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
  modelName: 'user',
})
export default class UserModel extends Model {
  @PrimaryKey
  @Unique
  @Column(DataType.STRING)
  public id!: string;

  @Unique
  @Column(DataType.STRING)
  public username!: string;

  @Column
  public email!: string;

  @Column
  public password!: string;
}
