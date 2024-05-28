import { App } from './app';
import mongoose from 'mongoose';
import { getConfig } from './config';
import logger from './lib/logger';
import { AuthRoute } from './modules/auth/auth.route';
import { connectMongoDB } from './infra/mongodb';
import { HealthCheckRoute } from './modules/healthcheck/healthcheck.route';
import { RedisClient } from './infra/redis/dal.redis';
import { UserRoute } from './modules/user/user.route';
const app = new App([new AuthRoute(), new HealthCheckRoute(), new UserRoute()]);
let server: any;

async function startServer() {
  try {
    if (getConfig().env) {
      logger.info('Config Module Initialized');
    }
    await connectMongoDB();
    server = app.listen();
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      RedisClient.quitAll();
      mongoose.connection.close();
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

const unexpectedErrorHandler = (error: string) => {
  logger.error(error);
  exitHandler();
};

startServer();

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  exitHandler();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received');
  exitHandler();
});
