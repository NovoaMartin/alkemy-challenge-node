import {
  Column, DataType, ForeignKey, Model, Table,
} from 'sequelize-typescript';
import CharacterModel from './CharacterModel';
import FilmModel from './FilmModel';

@Table({
  tableName: 'films_characters',
  timestamps: true,
  modelName: 'film_character',
})
export default class FilmCharacterModel extends Model {
  @ForeignKey(() => FilmModel)
  @Column(DataType.STRING)
    filmId!: string;

  @ForeignKey(() => CharacterModel)
  @Column(DataType.STRING)
    characterId!: string;
}
