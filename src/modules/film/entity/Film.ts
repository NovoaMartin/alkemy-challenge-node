export default class Film {
  constructor(
    public id: string | null,
    public title: string,
    public image: string,
    public releaseDate: Date,
    public rating: number,
    public createdAt: Date,
    public updatedAt: Date,
    public links?: { self?: { href: string }, characters?: { name: string, href: string }[] },
  ) {}
}
