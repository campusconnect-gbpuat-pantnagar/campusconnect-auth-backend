import mongoose from 'mongoose';
import { getConfig } from '../../config';
import logger from '../../lib/logger';

export const connectMongoDB = () => {
  mongoose.connect(getConfig().DATABASE_URL).then(() => {
    logger.info('Connected to MongoDB');
  });
};
