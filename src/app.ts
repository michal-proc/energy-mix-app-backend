import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import { errorHandler, notFoundHandler } from './errors/handler';
import { createSuccessResponse } from './responses/apiResponseCreator';
import energyRoutes from './routes/v1/energy.routes';

const API_PREFIX = '/api/v1';

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get(`${API_PREFIX}/health`, (_req: Request, res: Response) => {
    res.status(200).json(
      createSuccessResponse({
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      })
    );
  });

  app.use(`${API_PREFIX}/energy`, energyRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
