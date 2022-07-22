import CharacterRepository, { ISearchParams } from '../repository/CharacterRepository';
import Character from '../entity/Character';

export default class CharacterService {
  constructor(private characterRepository : CharacterRepository) {}

  async getAll({
    name, age, weight, filmName,
  }:ISearchParams) : Promise<Character[]> {
    return this.characterRepository.search({
      name, age, weight, filmName,
    });
  }

  async getById(id: string) : Promise<Character> {
    return this.characterRepository.getById(id);
  }

  async save(character: Partial<Character>, associatedFilms?: string[]) : Promise<Character> {
    return this.characterRepository.save(character, associatedFilms);
  }

  async delete(id: string) : Promise<void> {
    return this.characterRepository.delete(id);
  }
}
