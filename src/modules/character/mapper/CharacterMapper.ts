import CharacterModel from '../../../models/CharacterModel';
import Character from '../entity/Character';

export default async function fromModelToEntity(char: CharacterModel) {
  return new Character(
    char.id,
    char.name,
    char.image,
    char.story,
    char.age,
    char.weight,
    char.createdAt,
    char.updatedAt,
    (await char.getFilms()).map((film) => ({ title: film.title, href: `/films/${film.id}` })),
  );
}
