export default class Character {
  constructor(
    public id: number | null,
    public name: string,
    public image: string | null,
    public story: string,
    public age?: number,
    public weight?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
    public films?: { title: string, href: string }[],
  ) {}
}
