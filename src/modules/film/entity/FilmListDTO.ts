export default class FilmListDTO {
  public self: { href: string };

  constructor(
    public id: string,
    public title: string,
    public image: string,
    public releaseDate: Date,
  ) {
    this.self = { href: `${process.env.BASE_URL}/films/${id}` };
  }
}
