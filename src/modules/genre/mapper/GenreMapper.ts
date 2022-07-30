import GenreModel from '../../../models/GenreModel';
import Genre from '../entity/Genre';

export default async function fromModelToEntity(model: GenreModel): Promise<Genre> {
  const films = (await model.getFilms()).map((film) => ({
    name: film.title,
    href: `${process.env.BASE_URL}/movies/${film.id}`,
  }));
  return new Genre(
    model.id,
    model.name,
    model.image,
    model.createdAt,
    model.updatedAt,
    { self: { href: `${process.env.BASE_URL}/genres/${model.id}` }, films },
  );
}
