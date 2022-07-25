import { AwilixContainer } from 'awilix';
import { Application } from 'express';
import FilmController from './controller/FilmController';
import FilmRepository from './repository/FilmRepository';
import FilmService from './service/FilmService';

export default function initFilmModule(app: Application, container: AwilixContainer) {
  container.resolve('filmController').configureRoutes(app);
}

export {
  FilmController,
  FilmService,
  FilmRepository,
};
