import CharacterModel from '../../../models/CharacterModel';
import Character from '../entity/Character';

export default async function fromModelToEntity(char: CharacterModel) {
  const films = (await char.getFilms()).map((film) => ({ title: film.title, href: `/movies/${film.id}` }));
  return new Character(
    char.id,
    char.name,
    char.image,
    char.story,
    char.age,
    char.weight,
    char.createdAt,
    char.updatedAt,
    { self: { href: `/characters/${char.id}` }, films },
  );
}
