import FilmModel from '../../../models/FilmModel';
import Film from '../entity/Film';

export default async function fromModelToEntity(film: FilmModel) {
  const characters = (await film.getCharacters()).map((char) => ({
    name: char.name,
    href: `${process.env.BASE_URL}/characters/${char.id}`,
  }));
  const image = film.image.startsWith(process.env.BASE_URL!) ? film.image : `${process.env.BASE_URL}/${film.image}`;
  return new Film(
    film.id,
    film.title,
    image,
    film.releaseDate,
    film.rating,
    film.genreId,
    film.createdAt,
    film.updatedAt,
    { self: { href: `${process.env.BASE_URL}/movies/${film.id}` }, characters },
  );
}
