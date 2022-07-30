export default class Genre {
  constructor(
    public id: string | null,
    public name: string,
    public image: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public links?: {
      self?: { href: string },
      films?: { name: string, href: string }[]
    },
  ) {}
}
