import { config } from 'dotenv';
import {
  asClass, asValue, AwilixContainer, createContainer,
} from 'awilix';
import { Sequelize } from 'sequelize-typescript';
import sendgrid from '@sendgrid/mail';
import multer, { Multer } from 'multer';
import bcrypt from 'bcrypt';
import UserModel from '../models/UserModel';
import GenreModel from '../models/GenreModel';
import CharacterModel from '../models/CharacterModel';
import FilmModel from '../models/FilmModel';
import FilmCharacterModel from '../models/FilmCharacterModel';
import { CharacterController, CharacterService, CharacterRepository } from '../modules/character/module';
import AuthRepository from '../modules/auth/authRepository/AuthRepository';
import AuthService from '../modules/auth/authService/AuthService';
import AuthController from '../modules/auth/authController/AuthController';

config();

function configureMulter(): Multer {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  return multer({ storage });
}

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
    uploadMiddleware: asValue(configureMulter()),
  });
}

function addCharacterModuleDefinitions(container: AwilixContainer): void {
  container.register({
    characterRepository: asClass(CharacterRepository),
    characterService: asClass(CharacterService),
    characterController: asClass(CharacterController),
    characterModel: asValue(CharacterModel),
    encryptionService: asValue(bcrypt),
  });
}

function addAuthModuleDefinitions(container: AwilixContainer):void {
  container.register({
    authRepository: asClass(AuthRepository),
    authService: asClass(AuthService),
    authController: asClass(AuthController),
    userModel: asValue(UserModel),
  });
}

export default function configureDI(): AwilixContainer {
  const container: AwilixContainer = createContainer({ injectionMode: 'CLASSIC' });
  addCommonDefinitions(container);
  addCharacterModuleDefinitions(container);
  addAuthModuleDefinitions(container);
  return container;
}
