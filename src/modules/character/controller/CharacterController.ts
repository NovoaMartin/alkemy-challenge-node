import { Application, Request, Response } from 'express';
import CharacterService from '../service/CharacterService';
import CharacterNotFoundException from '../exception/CharacterNotFoundException';

export default class CharacterController {
  constructor(private characterService: CharacterService) {}

  configureRoutes(app: Application) {
    app.get('/characters', this.search.bind(this));
    app.get('/characters/:id', this.getById.bind(this));
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const character = await this.characterService.getById(id);
      return res.status(200).json(character);
    } catch (e) {
      if (e instanceof CharacterNotFoundException) {
        return res.status(404).json({ error: 'Character not found' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const {
        name, age, weight, filmName,
      } = req.query;

      const characters = await this.characterService.getAll({
        name: name as any, age: age as any, weight: weight as any, filmName: filmName as any,
      });

      return res.status(200).json({ data: characters });
    } catch (e) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {

  }

  async update(req: Request, res: Response) {

  }

  async delete(req: Request, res: Response) {

  }
}
