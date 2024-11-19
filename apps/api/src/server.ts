import { json, urlencoded } from 'body-parser';
import express from 'express';
import type { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import {
  getCloseCell,
  getGameInfo,
  move,
  reinforcement,
} from './controllers/Game';

export const createServer = (): Express => {
  const app = express();
  app
    .disable('x-powered-by')
    .use(morgan('dev'))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors());

  app.get('/gameinfos/:team', getGameInfo);
  app.post('/reinforcement/:team', reinforcement);
  app.post('/move/:team', move);
  app.get('/getValidCells/:cellId', getCloseCell);

  return app;
};
