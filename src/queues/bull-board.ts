import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { EMAIL_AUTH_NOTIFICATION_QUEUE } from './auth.notification.queue';
import logger from '@/lib/logger';
import { EMAIL_APP_NOTIFICATION_QUEUE } from './app.notification.queue';
import { CONTENT_MODERATION_QUEUE } from './content-moderation.queue';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/api/v1/admin/bullboard');

createBullBoard({
  queues: [
    new BullMQAdapter(EMAIL_AUTH_NOTIFICATION_QUEUE),
    new BullMQAdapter(EMAIL_APP_NOTIFICATION_QUEUE),
    new BullMQAdapter(CONTENT_MODERATION_QUEUE),
  ],
  serverAdapter,
});

const bullboardServerAdapter = () => {
  logger.info(`Bull board is ready`);
  return serverAdapter.getRouter();
};
export { bullboardServerAdapter };
