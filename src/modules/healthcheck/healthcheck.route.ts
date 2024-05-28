import { Router } from 'express';
import type { Route } from '../../interfaces/route.interface';
import { HealthCheckController } from './controllers/auth.controller';
import logger from '@/lib/logger';

export class HealthCheckRoute implements Route {
  public readonly path = '/healthcheck';
  public router = Router();
  public HealthCheckController = new HealthCheckController();
  constructor() {
    this.initializeRoutes();
    logger.info('HealthCheck Module initialized');
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, this.HealthCheckController.healthCheck);
  }
}
