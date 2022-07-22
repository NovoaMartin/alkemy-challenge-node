import { Application, Request, Response } from 'express';
import { Multer } from 'multer';
import CharacterService from '../service/CharacterService';
import CharacterNotFoundException from '../exception/CharacterNotFoundException';
import InvalidFilmGivenException from '../exception/InvalidFilmGivenException';

export default class CharacterController {
  constructor(private characterService: CharacterService, private uploadMiddleware: Multer) {}

  configureRoutes(app: Application) {
    app.get('/characters', this.search.bind(this));
    app.get('/characters/:id', this.getById.bind(this));
    app.post('/characters', this.uploadMiddleware.single('image'), this.create.bind(this));
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
    try {
      const {
        name, story, age, weight, filmIds,
      } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      if (!story) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      const image = req.file?.path || 'default.png';
      const result = await this.characterService.save({
        name, story, age, weight, image,
      }, filmIds || []);
      return res.status(201).json(result);
    } catch (e) {
      if (e instanceof InvalidFilmGivenException) {
        return res.status(400).json({ error: 'Invalid film id' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {

  }

  async delete(req: Request, res: Response) {

  }
}
