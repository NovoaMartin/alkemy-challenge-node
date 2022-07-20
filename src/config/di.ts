import { config } from 'dotenv';
import { asValue, AwilixContainer, createContainer } from 'awilix';
import { Sequelize } from 'sequelize-typescript';
import sendgrid from '@sendgrid/mail';
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
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
  container.register({
    sequelize: asValue(configureSequelize()),
    mailService: asValue(sendgrid),
  });
}

export default function configureDI() : AwilixContainer {
  const container: AwilixContainer = createContainer({ injectionMode: 'CLASSIC' });
  addCommonDefinitions(container);
  return container;
}
