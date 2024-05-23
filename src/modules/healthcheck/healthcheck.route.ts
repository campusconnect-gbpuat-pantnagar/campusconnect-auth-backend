import { Router } from 'express';
import type { Route } from '../../interfaces/route.interface';
import { HealthCheckController } from './controllers/auth.controller';

export class HealthCheckRoute implements Route {
  public readonly path = '/healthcheck';
  public router = Router();
  public HealthCheckController = new HealthCheckController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, this.HealthCheckController.healthCheck);
  }
}
