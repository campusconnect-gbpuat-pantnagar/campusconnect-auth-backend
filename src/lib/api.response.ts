import { Request, Response } from 'express';
import { getConfig } from '@/config';

import { CustomResponse } from '@/interfaces/response.interface';
import { globalConstants } from '@/utils';
import logger from './logger';

abstract class Api {
  public send<R>(
    res: Response<CustomResponse<R>>,
    data: R | null,
    message = 'service is healthy',
    statusCode: number = globalConstants.statusCode.HttpsStatusCodeOk.code,
    status: string = globalConstants.status.success,
  ) {
    if (getConfig().env === 'development') {
      // need to change based on environment
      logger.info(JSON.stringify(data, null, 2));
    }

    return res.status(statusCode).json({
      status,
      message,
      data,
      statusCode,
    });
  }

  public redirect(
    req: Request,
    res: Response,
    redirectUrl: string,
    statusCode: number = globalConstants.statusCode.TemporaryRedirect.code,
  ) {
    if (getConfig().env === 'development') {
      // need to change based on environment
      logger.info(` Request move  from $${req.url} to ${redirectUrl}`);
    }

    return res.status(statusCode).redirect(redirectUrl);
  }
}

export default Api;
