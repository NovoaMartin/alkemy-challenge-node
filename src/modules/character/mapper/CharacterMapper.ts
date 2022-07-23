import CharacterModel from '../../../models/CharacterModel';
import Character from '../entity/Character';

export default async function fromModelToEntity(char: CharacterModel) {
  const films = (await char.getFilms()).map((film) => ({
    title: film.title,
    href: `${process.env.BASE_URL}/movies/${film.id}`,
  }));
  const image = char.image.startsWith(process.env.BASE_URL!) ? char.image : `${process.env.BASE_URL}/${char.image}`;
  return new Character(
    char.id,
    char.name,
    image,
    char.story,
    char.age,
    char.weight,
    char.createdAt,
    char.updatedAt,
    { self: { href: `${process.env.BASE_URL}/characters/${char.id}` }, films },
  );
}
