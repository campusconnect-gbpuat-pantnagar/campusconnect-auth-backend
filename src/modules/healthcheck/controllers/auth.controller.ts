import { NextFunction, Request, RequestHandler, Response } from 'express';

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
