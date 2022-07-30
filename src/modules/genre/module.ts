import { Application } from 'express';
import { AwilixContainer } from 'awilix';
import GenreController from './controller/GenreController';
import GenreService from './service/GenreService';
import GenreRepository from './repository/GenreRepository';

export default function initGenreModule(app: Application, container: AwilixContainer) {
  container.resolve('genreController').configureRoutes(app);
}

export {
  GenreController,
  GenreService,
  GenreRepository,
};
