import { Application, Request, Response } from 'express';
import { Multer } from 'multer';
import FilmService from '../service/FilmService';
import FilmNotFoundException from '../exception/FilmNotFoundException';
import InvalidCharacterGivenException from '../exception/InvalidCharacterGivenException';

export default class FilmController {
  constructor(private filmService: FilmService, private uploadMiddleware: Multer) {}

  /* istanbul ignore next */
  configureRoutes(app: Application) {
    app.get('/movies', this.search.bind(this));
    app.get('/movies/:id', this.getById.bind(this));
    app.post('/movies', this.uploadMiddleware.single('image'), this.create.bind(this));
    app.patch('/movies/:id', this.uploadMiddleware.single('image'), this.update.bind(this));
    app.delete('/movies/:id', this.delete.bind(this));
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const film = await this.filmService.getById(id);
      return res.status(200).json(film);
    } catch (e) {
      if (e instanceof FilmNotFoundException) {
        return res.status(400).json({ error: 'Film not found' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const { title, genre, order } = req.query;

      const films = await this.filmService.getAll({
        title: title as any, genre: genre as any, order: order as any,
      });
      return res.status(200).json({ data: films });
    } catch (e) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const {
        title, releaseDate, rating, genreId,
      } = req.body;
      let { characterIds } = req.body;
      if (!title || !releaseDate || !rating || (rating && (rating < 0 || rating > 5))) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      if (!Array.isArray(characterIds) && characterIds) {
        characterIds = [characterIds];
      }

      const image = req.file?.path || process.env.DEFAULT_IMAGE_URL!;
      const result = await this.filmService.save({
        title, releaseDate, rating, genreId, image,
      }, characterIds || []);
      return res.status(201).json(result);
    } catch (e) {
      if (e instanceof InvalidCharacterGivenException) {
        return res.status(400).json({ error: 'Invalid character id' });
      }
      return res.status(500).json(e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const {
        title, releaseDate, rating, genreId,
      } = req.body;
      const { id } = req.params;
      let { characterIds } = req.body;
      if (!id || (rating && (rating < 0 || rating > 5))) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      const image = req.file?.path;

      const existingFilm = await this.filmService.getById(id);
      if (!Array.isArray(characterIds) && characterIds) {
        characterIds = [characterIds];
      }
      if (!Array.isArray(characterIds)) {
        characterIds = existingFilm.links?.characters?.map((char) => char.href.split('/characters/')[1]);
      }

      const result = await this.filmService.save({
        id,
        title: title || existingFilm.title,
        releaseDate: releaseDate || existingFilm.releaseDate,
        rating: rating || existingFilm.rating,
        genreId: genreId || existingFilm.genreId,
        image: image || existingFilm.image,
      }, characterIds || []);
      return res.status(200).json(result);
    } catch (e) {
      if (e instanceof InvalidCharacterGivenException) {
        return res.status(400).json({ error: 'Invalid character id' });
      }
      if (e instanceof FilmNotFoundException) {
        return res.status(404).json({ error: 'Film not found' });
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
      const result = !!(await this.filmService.delete(id));
      if (!result) {
        res.status(404).json({ error: 'Film not found' });
      }
      return res.status(204).send();
    } catch (e) {
      if (e instanceof FilmNotFoundException) {
        return res.status(404).json({ error: 'Film not found' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
