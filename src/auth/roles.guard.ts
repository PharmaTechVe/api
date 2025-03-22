import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/roles.decorador';
import { Role } from './rol.enum';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: { role: Role };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    console.log('Required roles:', requiredRoles);
    console.log('User:', user);

    if (!user) {
      throw new ForbiddenException('Access denied: No user found in request.');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied: You must have one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
