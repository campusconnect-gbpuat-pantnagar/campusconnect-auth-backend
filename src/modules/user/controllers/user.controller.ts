import { NextFunction, Request, RequestHandler, Response } from 'express';

import { getConfig } from '@/config';
import Api from '@/lib/api.response';

export class UserController extends Api {
  constructor() {
    super();
  }

  public userHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.send(res, null, 'response getting from temporary auth controller');
    } catch (err) {
      next(err);
    }
  };
}
