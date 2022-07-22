import {
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationsMixin, BelongsToManySetAssociationsMixin,
} from 'sequelize';
import {
  DataType, Column, Model, PrimaryKey, Unique, Default, AllowNull, BelongsToMany, Table,
} from 'sequelize-typescript';
import FilmCharacterModel from './FilmCharacterModel';
import FilmModel from './FilmModel';

@Table({
  tableName: 'characters',
  timestamps: true,
  modelName: 'character',
})
export default class CharacterModel extends Model {
  @PrimaryKey
  @Unique
  @Column(DataType.STRING)
    id!: string;

  @Column(DataType.STRING)
    name!: string;

  @Default('')
  @Column(DataType.STRING)
    image!: string;

  @AllowNull
  @Column
    age!: number;

  @AllowNull
  @Column
    weight!: number;

  @AllowNull
  @Column(DataType.TEXT)
    story!: string;

  @BelongsToMany(() => FilmModel, () => FilmCharacterModel)
    films!: FilmModel[];

  declare getFilms: BelongsToManyGetAssociationsMixin<FilmModel>;

  declare addFilm: BelongsToManyAddAssociationMixin<FilmModel, FilmCharacterModel['id']>;

  declare setFilms: BelongsToManySetAssociationsMixin<FilmModel, FilmCharacterModel['id']>;

  declare removeFilm: BelongsToManyRemoveAssociationsMixin<FilmModel, FilmCharacterModel['id']>;
}
