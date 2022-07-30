import { Multer } from 'multer';
import { Application, Request, Response } from 'express';
import GenreService from '../service/GenreService';
import GenreNotFoundException from '../exception/GenreNotFoundException';

export default class GenreController {
  constructor(private genreService: GenreService, private uploadMiddleware: Multer) {}

  /* istanbul ignore next */
  configureRoutes(app: Application) {
    app.get('/api/genres/:id', this.getById.bind(this));
    app.get('/api/genres', this.getAll.bind(this));
    app.post('/api/genres', this.uploadMiddleware.single('image'), this.create.bind(this));
    app.patch('/api/genres/:id', this.uploadMiddleware.single('image'), this.update.bind(this));
    app.delete('/api/genres/:id', this.delete.bind(this));
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await this.genreService.getById(req.params.id);
      return res.status(200).json({ data: result });
    } catch (e) {
      if (e instanceof GenreNotFoundException) {
        return res.status(404).json({ error: 'Genre not found' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const result = await this.genreService.getAll();
      return res.status(200).json({ data: result });
    } catch (e) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const {
        name,
      } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }
      const image = req.file?.path || process.env.DEFAULT_IMAGE_URL!;
      const result = await this.genreService.save({ name, image });
      return res.status(201).json({ data: result });
    } catch (e) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const {
        name,
      } = req.body;
      const image = req.file?.path || process.env.DEFAULT_IMAGE_URL!;
      const { id } = req.params;
      const existingGenre = await this.genreService.getById(id);
      const result = await this.genreService.save({
        id,
        name: name || existingGenre.name,
        image: image || existingGenre.image,
      });
      return res.status(200).json({ data: result });
    } catch (e) {
      if (e instanceof GenreNotFoundException) {
        return res.status(404).json({ error: 'Genre not found' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.genreService.delete(id);
      return res.status(204).json();
    } catch (e) {
      if (e instanceof GenreNotFoundException) {
        return res.status(404).json({ error: 'Genre not found' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
