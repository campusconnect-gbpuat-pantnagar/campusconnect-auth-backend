import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AuthService } from '../services/auth.service';
import Api from '../../../lib/api.response';
import { RefreshTokenService } from '../../../modules/refresh-token/refresh-token.service';
import { CryptoService } from '../../../helpers/crypto.service';
import ApiError from '../../../exceptions/http.exception';
import { HttpStatusCode } from '../../../enums';
import { getConfig } from '../../../config';

export class RefreshTokenController extends Api {
  private readonly _refreshTokenService: RefreshTokenService;
  private readonly _cryptoService: CryptoService;
  private readonly _authService: AuthService;
  constructor() {
    super();
    this._refreshTokenService = new RefreshTokenService();
    this._cryptoService = new CryptoService();
    this._authService = new AuthService();
  }

  public refreshToken: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookie = req.cookies;
      if (!cookie.refresh_token) {
        throw new ApiError(HttpStatusCode.UNAUTHORIZED, 'JWT cookie is missing or Invalid !');
      }
      const refreshToken = cookie.refresh_token;
      res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.clearCookie('refresh_token_expires_at', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      // fetch user  based on refresh token
      const user = await this._refreshTokenService.getUserByRefreshToken(refreshToken);
      if (!user?.id) {
        // means refresh token resuse

        const { id, gbpuatId, role } = await this._cryptoService.verifyRefreshToken(refreshToken);

        //remove all the refresh token from refresh model belong to hackedUser
        await this._refreshTokenService.deleteAllRefreshTokenByUser(id);

        throw new ApiError(HttpStatusCode.FORBIDDEN, 'Invalid refresh token: Token reuse detected');
      }
      const { id, gbpuatId, role } = await this._cryptoService.verifyRefreshToken(refreshToken);
      if (id !== user.id) {
        throw new ApiError(HttpStatusCode.UNAUTHORIZED, 'Invalid user!');
      }
      await this._refreshTokenService.deleteRefreshToken({
        userId: user?.id,
        refreshToken,
      });

      const {
        access_token,
        refresh_token: newRefreshToken,
        refresh_token_expires_at,
        access_token_expires_at,
      } = await this._authService.getTokens({
        id: user.id,
        gbpuatId: user.gbpuatId,
        role: user.role,
      });
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_REFRESH_TOKEN_COOKIE_EXPIRATION,
      });
      res.cookie('refresh_token_expires_at', refresh_token_expires_at, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_REFRESH_TOKEN_COOKIE_EXPIRATION,
      });

      this.send(
        res,
        { access_token, access_token_expires_at, refresh_token_expires_at, refresh_token: newRefreshToken },
        'New Refresh Token and Access Token ',
      );
    } catch (err) {
      next(err);
    }
  };
}
