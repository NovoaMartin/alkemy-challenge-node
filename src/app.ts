import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import configureDI from './config/di';
import swaggerDocument from '../swagger.json';
import initCharacterModule from './modules/character/module';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const container = configureDI();

initCharacterModule(app, container);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => { console.log(`Server is listening on port ${PORT}`); });
