import { v4 } from 'uuid';
import { Op } from 'sequelize';
import CharacterModel from '../../../models/CharacterModel';
import Character from '../entity/Character';
import fromModelToEntity from '../mapper/CharacterMapper';
import CharacterNotFoundException from '../exception/CharacterNotFoundException';
import FilmModel from '../../../models/FilmModel';
import InvalidFilmGivenException from '../exception/InvalidFilmGivenException';
import CharacterListDTO from '../entity/CharacterListDTO';

export interface ISearchParams {
  name?: string | null;
  age?: number | null;
  weight?: number | null;
  filmName?: string | null;
}

export default class CharacterRepository {
  constructor(private characterModel: typeof CharacterModel, private filmModel: typeof FilmModel) {}

  public async getById(id: string): Promise<Character> {
    const model = await this.characterModel.findByPk(id);
    if (!model) {
      throw new CharacterNotFoundException();
    }
    return fromModelToEntity(model);
  }

  public async save(character: Partial<Character>, associatedFilms?: string[]): Promise<Character> {
    const isNewRecord = !character.id;
    if (isNewRecord) {
      // eslint-disable-next-line no-param-reassign
      character.id = v4();
    }
    let films: FilmModel[] = [];
    if (associatedFilms) {
      films = await this.filmModel.findAll({
        where: {
          id: {
            [Op.in]: associatedFilms,
          },
        },
      });
      if (films.length !== associatedFilms.length) {
        throw new InvalidFilmGivenException();
      }
    }
    const instance = this.characterModel.build(character, { isNewRecord });
    const result = await instance.save();
    await instance.setFilms(films);
    return fromModelToEntity(result);
  }

  async delete(id: string) {
    const model = await this.characterModel.findByPk(id);
    if (!model) {
      throw new CharacterNotFoundException();
    }
    return this.characterModel.destroy({ where: { id } });
  }

  async search({
    name, age, weight, filmName,
  }: ISearchParams): Promise<CharacterListDTO[]> {
    const whereCondition: any = {};
    const includeCondition: any = [];
    if (name) {
      whereCondition.name = {
        [Op.like]: `%${name}%`,
      };
    }
    if (age) {
      whereCondition.age = age;
    }
    if (weight) {
      whereCondition.weight = weight;
    }
    if (filmName) {
      includeCondition.push({
        model: this.filmModel,
        where: {
          title: {
            [Op.like]: `%${filmName}%`,
          },
        },
      });
    }
    return Promise.all(
      (await this.characterModel.findAll({
        attributes: ['id', 'name', 'image'],
        where: whereCondition,
        include: includeCondition,
      })).map((character) => new CharacterListDTO(character.id, character.name, character.image)),
    );
  }
}
