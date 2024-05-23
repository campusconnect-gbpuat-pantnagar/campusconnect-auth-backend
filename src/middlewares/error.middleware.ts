import ApiError from '@/exceptions/http.exception';
import { ValidationException } from '@/exceptions/validation.exception';
import logger from '@/lib/logger';
import { globalConstants } from '@/utils';
import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

interface validationError {
  error: string;
  field: string | undefined;
}

export const errorConverter = (err: any, _req: Request, _res: Response, next: NextFunction) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message: string = error.message || `${httpStatus[statusCode]}`;
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

export const errorMiddleware = async (error: ApiError, req: Request, res: Response, next: NextFunction) => {
  try {
    if (error instanceof ValidationException) {
      const message: validationError[] = [];
      const statusCode = 400;
      for (const err of error.errors) {
        const field = err.path.split('.').pop();
        message.push({ field, error: err.message });
      }
      logger.error(`[${req.method}] ${req.path} || StatusCode:: ${statusCode}, Message:: ${message}`);

      res.status(statusCode).json({
        status: globalConstants.status.failed,
        message,
        error: error.name,
        statusCode: statusCode,
      });
    } else {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Something went wrong';
      const ErrorStack = process.env.NODE_ENV !== 'production' ? error.stack : '';

      logger.error(`[${req.method}] ${req.path} || StatusCode:: ${statusCode}, Message:: ${message}`);

      if (process.env.NODE_ENV !== 'production') {
        res.status(statusCode).json({
          status: globalConstants.status.failed,
          message,
          error: error.name,
          ErrorStack,
          statusCode: statusCode,
        });
      } else {
        res.status(statusCode).json({
          status: globalConstants.status.failed,
          message,
          error: error.name,
          statusCode: statusCode,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};
