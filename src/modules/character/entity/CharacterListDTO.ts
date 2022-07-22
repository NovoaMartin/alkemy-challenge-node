export default class CharacterListDTO {
  public self: { href: string };

  constructor(public id: string, public name: string, public image: string) {
    this.self = { href: `/characters/${id}` };
  }
}
