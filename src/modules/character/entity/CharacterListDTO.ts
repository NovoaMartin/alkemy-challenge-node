export default class CharacterListDTO {
  public self: { href: string };

  constructor(public id: string, public name: string, public image: string) {
    if (!this.image.startsWith(process.env.BASE_URL!)) {
      this.image = `${process.env.BASE_URL}/${this.image}`;
    }
    this.self = { href: `${process.env.BASE_URL}/characters/${id}` };
  }
}
