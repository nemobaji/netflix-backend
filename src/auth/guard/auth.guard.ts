import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenType } from '../../types/token';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorator/public.decorater';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Public 데코레이터가 선언되어있는 경우에 가드를 적용하지 않음.
    const isPublic = this.reflector.get(Public, context.getHandler());
    if (isPublic) {
      return true;
    }

    // 요청에서 payload 객체가 유효한지 검증
    const req = context.switchToHttp().getRequest<Request>();
    const payload = req.payload;
    if (!payload || payload.type !== TokenType.ACCESS) {
      return false;
    }
    return true;
  }
}
