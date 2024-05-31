import { HttpStatusCode } from '@/enums';
import ApiError from '@/exceptions/http.exception';
import { CryptoService } from '@/helpers/crypto.service';
import { globalConstants } from '@/utils';
import { NextFunction, Request, Response } from 'express';

export async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization as string;

    if (!authorization) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        status: globalConstants.status.failed,
        message: 'No authorization header | not authorized',
        error: globalConstants.statusCode.UnauthorizedException.statusCodeName,
        statusCode: globalConstants.statusCode.UnauthorizedException.code,
      });
    }

    //  if authorization header present but not in proper format

    const [bearer, token] = authorization.split(' ');

    if (bearer != 'Bearer' || !token) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        status: globalConstants.status.failed,
        message: 'Invalid authorization header format. Format is "Bearer <token>".',
        error: globalConstants.statusCode.UnauthorizedException.statusCodeName,
        statusCode: globalConstants.statusCode.UnauthorizedException.code,
      });
    }

    try {
      const cryptoService = new CryptoService();
      const JwtUserPayload = await cryptoService.verifyAccessToken(token);
      req.user = JwtUserPayload;
      //   console.log(req.user);
      next();
    } catch (err) {
      if ((err as Error).name !== 'TokenExpiredError') {
        throw new ApiError(globalConstants.statusCode.UnauthorizedException.code, 'Invalid  access token');
      }
      throw new ApiError(globalConstants.statusCode.UnauthorizedException.code, 'token exipre');
    }
  } catch (err) {
    return res.status(globalConstants.statusCode.UnauthorizedException.code).json({
      status: globalConstants.status.failed,
      message: (err as Error).message,
      data: null,
      statusCode: globalConstants.statusCode.UnauthorizedException.code,
    });
  }
}
