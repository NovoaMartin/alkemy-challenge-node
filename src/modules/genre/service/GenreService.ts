import GenreRepository from '../repository/GenreRepository';
import Genre from '../entity/Genre';

export default class GenreService {
  constructor(private genreRepository: GenreRepository) {}

  async getAll(): Promise<Genre[]> {
    return this.genreRepository.findAll();
  }

  async getById(id: string): Promise<Genre> {
    return this.genreRepository.getById(id);
  }

  async save(genre: Partial<Genre>): Promise<Genre> {
    return this.genreRepository.save(genre);
  }

  async delete(id: string): Promise<number> {
    return this.genreRepository.delete(id);
  }
}
