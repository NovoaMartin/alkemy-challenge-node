import {
  DataType, Column, Model, PrimaryKey, Unique, Default, ForeignKey, BelongsTo, BelongsToMany,
  Table,
} from 'sequelize-typescript';
import {
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin, BelongsToManySetAssociationsMixin,
  BelongsToSetAssociationMixin,
} from 'sequelize';
import GenreModel from './GenreModel';
import CharacterModel from './CharacterModel';
import FilmCharacterModel from './FilmCharacterModel';

@Table({
  tableName: 'films',
  timestamps: true,
  modelName: 'film',
})
export default class FilmModel extends Model {
  @PrimaryKey
  @Unique
  @Column(DataType.STRING)
    id!: string;

  @Column(DataType.STRING)
    title!: string;

  @Column(DataType.DATE)
    releaseDate!: Date;

  @Column(DataType.FLOAT)
    rating!: number;

  @Default('')
  @Column(DataType.STRING)
    image!: string;

  @ForeignKey(() => GenreModel)
  @Column(DataType.STRING)
    genreId!: string;

  @BelongsTo(() => GenreModel, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
    genre!: GenreModel;

  @BelongsToMany(() => CharacterModel, () => FilmCharacterModel)
    characters!: CharacterModel[];

  declare getCharacters: BelongsToManyGetAssociationsMixin<CharacterModel>;

  declare addCharacter: BelongsToManyAddAssociationMixin<CharacterModel, CharacterModel['id']>;

  declare setCharacters: BelongsToManySetAssociationsMixin<CharacterModel, CharacterModel['id']>;

  declare removeCharacter: BelongsToManyRemoveAssociationMixin<CharacterModel, CharacterModel['id']>;

  declare getGenre: BelongsToGetAssociationMixin<GenreModel>;

  declare setGenre: BelongsToSetAssociationMixin<GenreModel, GenreModel['id']>;
}
