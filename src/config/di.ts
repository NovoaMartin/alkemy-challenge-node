import { config } from 'dotenv';
import { asValue, AwilixContainer, createContainer } from 'awilix';
import { Sequelize } from 'sequelize-typescript';
import UserModel from '../models/UserModel';
import GenreModel from '../models/GenreModel';
import CharacterModel from '../models/CharacterModel';
import FilmModel from '../models/FilmModel';
import FilmCharacterModel from '../models/FilmCharacterModel';

config();

function configureSequelize(): Sequelize {
  const sequelize = new Sequelize(process.env.DB_URI || '', {
    dialect: 'postgres',
  });
  sequelize.addModels([UserModel, FilmModel, CharacterModel, GenreModel, FilmCharacterModel]);
  return sequelize;
}

function addCommonDefinitions(container: AwilixContainer): void {
  container.register({
    sequelize: asValue(configureSequelize()),
  });
}

export default function configureDI() : AwilixContainer {
  const container: AwilixContainer = createContainer({ injectionMode: 'CLASSIC' });
  addCommonDefinitions(container);
  return container;
}
