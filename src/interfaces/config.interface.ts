import { CorsOptions } from 'cors';

export interface Config {
  env: string;
  DATABASE_URL: string;
  server: {
    protocol: string;
    host: string;
    port: number;
  };
  log: {
    format: 'combined' | 'common' | 'dev' | 'short' | 'tiny';
    level: 'error' | 'warn' | 'info' | 'http' | 'debug';
  };
  allowedOrigins: Array<string> | undefined;

  ARGON_SECRET_PEPPER: string;

  JWT_ACCESS_TOKEN_EXPIRATION: string;
  JWT_ACCESS_TOKEN_SECRET: string;

  OTP_EXPIRE_IN_TIME: number;
}
