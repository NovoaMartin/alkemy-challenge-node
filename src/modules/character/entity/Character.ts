export default class Character {
  constructor(
    public id: string | null,
    public name: string,
    public image: string | null,
    public story: string,
    public age?: number,
    public weight?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
    public links?: { self?: { href: string }, films?: { title: string, href: string }[] },
  ) {}
}
