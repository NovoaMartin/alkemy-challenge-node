/* eslint-disable */
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols

import Express from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
