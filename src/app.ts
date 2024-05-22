import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Config, Route } from '@/interfaces';
import xss from 'xss-clean';
import http, { Server } from 'http';
import { getConfig } from '@/config';
import { globalConstants } from '@/utils';
import logger from '@/lib/logger';
import { errorConverter, errorMiddleware } from '@/middlewares/error.middleware';
import ExpressMongoSanitize from 'express-mongo-sanitize';

export class App {
  public app: express.Application;
  public port: number;
  public config: Config;
  public env: string;
  public server: Server;
  public protocol: string;

  constructor(routes: Route[]) {
    this.config = getConfig();
    this.app = express();
    this.server = http.createServer(this.app);
    this.env = this.config.env;
    this.port = this.config.server.port;
    this.protocol = this.config.server.protocol;
    this.initializeMiddleware();
    this.initializeRoutes(routes);
    this.initializeRouteFallback();
    this.initializeErrorHandling();
    this.disableSettings();
  }

  private initializeMiddleware() {
    this.app.use(morgan(this.config.log.format));
    this.app.use(helmet());

    this.app.use(
      cors({
        origin: getConfig().allowedOrigins,
        credentials: true,
      }),
    );
    this.app.use(express.json({ limit: '20mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(xss());
    this.app.use(cookieParser());
    this.app.use(ExpressMongoSanitize());
  }

  private initializeRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use('/api/v1', route.router);
    });
  }

  private disableSettings(): void {
    this.app.disable('x-powered-by');
  }

  private initializeRouteFallback() {
    this.app.use((req, res) => {
      res.status(globalConstants.statusCode.NotFoundException.code).json({
        status: globalConstants.status.failed,
        message: `Cannot ${req.method} ${req.url}`,
        error: globalConstants.statusCode.NotFoundException.statusCodeName,
        statusCode: globalConstants.statusCode.NotFoundException.code,
      });
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorConverter);
    this.app.use(errorMiddleware);
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`🚀 Server listening on ${this.config.server.protocol}://${this.config.server.host}:${this.port}`);
    });
  }

  public getApp() {
    return this.app;
  }
}
