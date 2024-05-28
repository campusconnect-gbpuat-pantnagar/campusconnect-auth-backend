import { Queue } from 'bullmq';
import { EmailQueues } from './queue.constants';
import { getConfig } from '../config';

export const EMAIL_APP_NOTIFICATION_QUEUE = new Queue(EmailQueues.APP_NOTIFICATION, {
  connection: {
    host: getConfig().REDIS_APP_NOTIFICATION_HOST,
    port: getConfig().REDIS_APP_NOTIFICATION_PORT,
    username: getConfig().REDIS_APP_NOTIFICATION_USER,
    password: getConfig().REDIS_APP_NOTIFICATION_PASS,
  },
  defaultJobOptions: {
    removeOnComplete: true, // Remove job from the queue once it's completed
    attempts: 3, // Number of attempts before a job is marked as failed
    removeOnFail: {
      age: 200,
      count: 10,
    },
    backoff: {
      // Optional backoff settings for retrying failed jobs
      type: 'exponential',
      delay: 60000, // Initial delay of 60 second
    },
  },
});
