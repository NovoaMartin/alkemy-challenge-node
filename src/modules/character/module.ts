import { Application } from 'express';
import { AwilixContainer } from 'awilix';
import CharacterRepository from './repository/CharacterRepository';
import CharacterController from './controller/CharacterController';
import CharacterService from './service/CharacterService';

export default function initCharacterModule(app: Application, container: AwilixContainer) {
  container.resolve('characterController').configureRoutes(app);
}
export {
  CharacterRepository,
  CharacterController,
  CharacterService,
};
