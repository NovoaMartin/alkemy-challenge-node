import express from 'express';
import dotenv from 'dotenv';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import configureDI from './config/di';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const swaggerJsdocOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alkemy challenge nodejs',
      version: '1.0.0',
    },
  },
  apis: ['./src/modules/**/*Controller.ts'],
};

const openApiSpec = swaggerJSDoc(swaggerJsdocOptions);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const container = configureDI();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => { console.log(`Server is listening on port ${PORT}`); });
