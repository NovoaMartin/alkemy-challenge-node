import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import configureDI from './config/di';
import swaggerDocument from '../swagger.json';
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

initAuthModule(container, app);

// eslint-disable-next-line no-console
app.listen(PORT, () => { console.log(`Server is listening on port ${PORT}`); });
