import { getConfig } from '@/config';
import logger from '@/lib/logger';
import mongoose from 'mongoose';

export const connectMongoDB = () => {
  mongoose.connect(getConfig().DATABASE_URL).then(() => {
    logger.info('Connected to MongoDB');
  });
};
