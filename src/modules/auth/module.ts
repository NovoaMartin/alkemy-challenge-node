import { AwilixContainer } from 'awilix';
import { Application } from 'express';
import AuthController from './authController/AuthController';
import AuthService from './authService/AuthService';
import AuthRepository from './authRepository/AuthRepository';

export default function init(container:AwilixContainer, app :Application) {
  container.resolve('authController').configureRoutes(app);
}

export {
  AuthController,
  AuthService,
  AuthRepository,
};
