import { Application, Request, Response } from 'express';
import { Multer } from 'multer';
import CharacterService from '../service/CharacterService';
import CharacterNotFoundException from '../exception/CharacterNotFoundException';
import InvalidFilmGivenException from '../exception/InvalidFilmGivenException';

export default class CharacterController {
  constructor(private characterService: CharacterService, private uploadMiddleware: Multer) {}

  /* istanbul ignore next */
  configureRoutes(app: Application) {
    app.get('/characters', this.search.bind(this));
    app.get('/characters/:id', this.getById.bind(this));
    app.post('/characters', this.uploadMiddleware.single('image'), this.create.bind(this));
    app.patch('/characters/:id', this.uploadMiddleware.single('image'), this.update.bind(this));
    app.delete('/characters/:id', this.delete.bind(this));
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
    try {
      const { id } = req.params;
      const {
        name, story, age, weight,
      } = req.body;
      let { filmIds } = req.body;
      const image = req.file?.path;

      if (!id) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      const existingCharacter = await this.characterService.getById(id);

      if (!Array.isArray(filmIds)) {
        filmIds = existingCharacter.links?.films?.map((film) => film.href.split('/movies/')[1]);
      }

      const result = await this.characterService.save({
        id,
        name: name || existingCharacter.name,
        story: story || existingCharacter.story,
        age: age || existingCharacter.age,
        weight: weight || existingCharacter.weight,
        image: image || existingCharacter.image,
      }, filmIds || []);

      return res.status(200).json(result);
    } catch (e) {
      if (e instanceof InvalidFilmGivenException) {
        return res.status(400).json({ error: 'Invalid film id' });
      }
      if (e instanceof CharacterNotFoundException) {
        return res.status(404).json({ error: 'Character not found' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      const result = !!(await this.characterService.delete(id));
      if (!result) {
        return res.status(404).json({ error: 'Character not found' });
      }
      return res.status(204).json();
    } catch (e) {
      if (e instanceof CharacterNotFoundException) {
        return res.status(404).json({ error: 'Character not found' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
