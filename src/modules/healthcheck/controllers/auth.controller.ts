import { NextFunction, Request, RequestHandler, Response } from 'express';

import Api from '@/lib/api.response';

export class HealthCheckController {
  constructor() {}

  public healthCheck: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.send('CAMPUSCONNECT AUTH SERVICE  IS HEALTHY ✅ 🚀.');
    } catch (err) {
      next(err);
    }
  };
}
