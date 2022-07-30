import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import configureDI from './config/di';
import swaggerDocument from '../swagger.json';
import initCharacterModule from './modules/character/module';
import initAuthModule from './modules/auth/module';
import initFilmModule from './modules/film/module';
import initGenreModule from './modules/genre/module';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const container = configureDI();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
initAuthModule(container, app);
initCharacterModule(app, container);
initFilmModule(app, container);
initGenreModule(app, container);

app.get('/', (req: Request, res: Response) => res.redirect('/api-docs'));

// eslint-disable-next-line no-console
app.listen(PORT, () => { console.log(`Server is listening on port ${PORT}`); });
