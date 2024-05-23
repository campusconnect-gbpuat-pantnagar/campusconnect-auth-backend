import { App } from '@/app';
import mongoose from 'mongoose';
import { getConfig } from './config';
import logger from '@/lib/logger';
import { AuthRoute } from './modules/auth/auth.route';
import { connectMongoDB } from '@/infra/mongodb';
import Redis from '@/infra/redis/dal.redis';
const app = new App([new AuthRoute()]);
let server: any;

async function startServer() {
  connectMongoDB();
  server = app.listen();
  await Redis.connect();
}
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

startServer();
Redis.on('error', (err) => {
  logger.error('Redis error:', err);
});
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
