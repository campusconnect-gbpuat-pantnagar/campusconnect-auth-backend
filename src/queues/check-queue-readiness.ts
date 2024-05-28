import { Queue } from 'bullmq';
import logger from '../lib/logger';

export const checkQueueReadiness = async (queue: Queue): Promise<void> => {
  try {
    await queue.waitUntilReady();
    logger.info(`Queue ${queue.name} is ready`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Queue ${queue.name} is not ready: ${error.message}`);
    } else {
      logger.error(`Queue ${queue.name} is not ready: ${String(error)}`);
    }
    throw error;
  }
};
