import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../user/entity/user.entity';
import { RBAC } from '../decorator/rbac.decorater';
import { Request } from 'express';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get<Role>(RBAC, context.getHandler());
    if (!Object.values(Role).includes(role)) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const payload = req.payload;

    if (!payload) {
      return false;
    }

    return payload.role <= role;
  }
}
