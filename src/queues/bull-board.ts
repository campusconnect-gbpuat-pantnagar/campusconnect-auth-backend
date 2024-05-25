import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { EMAIL_AUTH_NOTIFICATION_QUEUE } from './auth.notification.queue';
import logger from '@/lib/logger';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/api/v1/bullboard');

createBullBoard({
  queues: [new BullMQAdapter(EMAIL_AUTH_NOTIFICATION_QUEUE)],
  serverAdapter,
});

const bullboardServerAdapter = () => {
  logger.debug(`Bull board is ready`);
  return serverAdapter.getRouter();
};
export { bullboardServerAdapter };
