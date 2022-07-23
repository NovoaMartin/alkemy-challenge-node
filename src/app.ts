import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import configureDI from './config/di';
import swaggerDocument from '../swagger.json';
import initCharacterModule from './modules/character/module';
import initAuthModule from './modules/auth/module';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const container = configureDI();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/images', express.static(path.join(__dirname, '../', 'images')));

initAuthModule(container, app);
initCharacterModule(app, container);

// eslint-disable-next-line no-console
app.listen(PORT, () => { console.log(`Server is listening on port ${PORT}`); });
