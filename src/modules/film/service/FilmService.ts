import FilmRepository from '../repository/FilmRepository';
import Film from '../entity/Film';
import FilmListDTO from '../entity/FilmListDTO';

interface ISearchParams {
  title?: string | null;
  genre?: string | null;
  order?: string | null;
}

export default class FilmService {
  constructor(private filmRepository: FilmRepository) {}

  public async getById(id: string): Promise<Film> {
    return this.filmRepository.getById(id);
  }

  public async save(film: Partial<Film>, associatedCharacters?: string[]): Promise<Film> {
    return this.filmRepository.save(film, associatedCharacters);
  }

  public async getAll({ title, genre: genreId, order }: ISearchParams): Promise<FilmListDTO[]> {
    return this.filmRepository.search({ title, genre: genreId, order });
  }

  public async delete(id: string): Promise<number> {
    return this.filmRepository.delete(id);
  }
}
