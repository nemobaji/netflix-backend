import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { envVariableKeys } from '../../common/const/env.const';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      next();
      return;
    }
    // authHeader: 'Bearer $token'
    const token = this.validateBearerToken(authHeader);

    try {
      const decodedPayload = this.jwtService.decode(token);
      if (
        decodedPayload.type !== 'access' &&
        decodedPayload.type !== 'refresh'
      ) {
        throw new UnauthorizedException('잘못된 형식의 토큰입니다.');
      }
      const secretKey =
        decodedPayload.type === 'refresh'
          ? envVariableKeys.refreshTokenSecret
          : envVariableKeys.accessTokenSecret;
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>(secretKey),
      });
      req.user = payload;
      next();
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new UnauthorizedException('토큰이 만료되었습니다');
    }
  }

  validateBearerToken(rawToken: string) {
    // rawToken: 'Bearer $token'
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('잘못된 토큰 형식입니다.');
    }
    const [bearer, token] = basicSplit;
    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('잘못된 토큰 형식입니다.');
    }
    return token;
  }
}
