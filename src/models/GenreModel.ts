import {
  Column, DataType, Default, HasMany, Model, PrimaryKey, Table, Unique,
} from 'sequelize-typescript';
import { HasManyGetAssociationsMixin } from 'sequelize';
import FilmModel from './FilmModel';

@Table({
  tableName: 'genres',
  timestamps: true,
  modelName: 'genre',
})
export default class GenreModel extends Model {
  @PrimaryKey
  @Unique
  @Column(DataType.STRING)
    id!: string;

  @Column(DataType.STRING)
    name!: string;

  @Default('')
  @Column(DataType.STRING)
    image!: string;

  @HasMany(() => FilmModel)
    films!: FilmModel[];

  declare getFilms: HasManyGetAssociationsMixin<FilmModel>;
}
