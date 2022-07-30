import { config } from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import UserModel from '../../models/UserModel';
import CharacterModel from '../../models/CharacterModel';
import GenreModel from '../../models/GenreModel';
import FilmModel from '../../models/FilmModel';
import FilmCharacterModel from '../../models/FilmCharacterModel';

config();

(async () => {
  const sequelize = new Sequelize(process.env.DATABASE_URL!, {
    dialect: 'postgres',
    models: [UserModel, CharacterModel, FilmModel, GenreModel, FilmCharacterModel],
  });
  await sequelize.sync({ force: true });
})();
