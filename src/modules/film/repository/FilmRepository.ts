import { v4 } from 'uuid';
import { Op } from 'sequelize';
import Film from '../entity/Film';
import FilmNotFoundException from '../exception/FilmNotFoundException';
import fromModelToEntity from '../mapper/FilmMapper';
import FilmListDTO from '../entity/FilmListDTO';
import FilmModel from '../../../models/FilmModel';
import CharacterModel from '../../../models/CharacterModel';
import InvalidCharacterGivenException from '../exception/InvalidCharacterGivenException';

interface ISearchParams {
  title?: string | null;
  genre?: string | null;
  order?: string | null;
}

export default class FilmRepository {
  constructor(private filmModel: typeof FilmModel, private characterModel: typeof CharacterModel) {}

  public async getById(id: string): Promise<Film> {
    const model = await this.filmModel.findByPk(id);
    if (!model) {
      throw new FilmNotFoundException();
    }
    return fromModelToEntity(model);
  }

  public async save(film: Partial<Film>, associatedCharacters?: string[]): Promise<Film> {
    const isNewRecord = !film.id;
    if (isNewRecord) {
      // eslint-disable-next-line no-param-reassign
      film.id = v4();
    }
    let chars: CharacterModel[] = [];
    if (associatedCharacters) {
      chars = await this.characterModel.findAll({
        where: {
          id: {
            [Op.in]: associatedCharacters,
          },
        },
      });
      if (chars.length !== associatedCharacters.length) {
        throw new InvalidCharacterGivenException();
      }
    }
    const instance = this.filmModel.build(film, { isNewRecord });
    const result = await instance.save();
    await instance.setCharacters(chars);
    return fromModelToEntity(result);
  }

  public async search({ title, genre: genreId, order }: ISearchParams): Promise<FilmListDTO[]> {
    const whereCondition: any = {};
    if (title) {
      whereCondition.title = {
        [Op.like]: `%${title}%`,
      };
    }
    if (genreId) {
      whereCondition.genreId = genreId;
    }

    const orderCondition: any = [['title', order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']];

    const result = await this.filmModel.findAll({
      attributes: ['id', 'title', 'image', 'releaseDate'],
      where: whereCondition,
      order: orderCondition,
    });
    return result.map(
      (model) => new FilmListDTO(model.id, model.title, model.image, model.releaseDate),
    );
  }
}
