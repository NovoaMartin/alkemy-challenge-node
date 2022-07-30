import { v4 } from 'uuid';
import GenreModel from '../../../models/GenreModel';
import Genre from '../entity/Genre';
import GenreNotFoundException from '../exception/GenreNotFoundException';
import fromModelToEntity from '../mapper/GenreMapper';

export default class GenreRepository {
  constructor(private genreModel: typeof GenreModel) { }

  async findAll(): Promise<Genre[]> {
    const genres = await this.genreModel.findAll();
    return genres.map((genre) => fromModelToEntity(genre));
  }

  async getById(id: string): Promise<Genre> {
    const genre = await this.genreModel.findByPk(id);
    if (!genre) {
      throw new GenreNotFoundException(id);
    }
    return fromModelToEntity(genre);
  }

  async save(genre: Partial<Genre>): Promise<Genre> {
    const isNewRecord = !genre.id;
    if (isNewRecord) {
      // eslint-disable-next-line no-param-reassign
      genre.id = v4();
    }
    const instance = this.genreModel.build(genre, { isNewRecord });
    const result = await instance.save();
    return (result);
  }

  async delete(id: string): Promise<number> {
    const genre = await this.genreModel.findByPk(id);
    if (!genre) {
      throw new GenreNotFoundException(id);
    }
    return this.genreModel.destroy({ where: { id } });
  }
}
