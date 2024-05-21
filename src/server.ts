import { App } from '@/app';
import mongoose from 'mongoose';
import { getConfig } from './config';
import logger from '@/lib/logger';
import { AuthRoute } from './modules/auth/auth.route';
const app = new App([new AuthRoute()]);
let server: any;

mongoose.connect(getConfig().DATABASE_URL).then(() => {
  logger.info('Connected to MongoDB');
  server = app.listen();
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: string) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
