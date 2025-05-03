import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/roles.decorador';
import { Request } from 'express';
import { Socket } from 'socket.io';
import { User, UserRole } from 'src/user/entities/user.entity';
import { WsException } from '@nestjs/websockets';

interface RequestWithUser extends Request {
  user?: { role: UserRole };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        'Access denied: No user found in request.',
      );
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied: You must have one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

@Injectable()
export class RolesGuardWs implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user: User = client.data.user as User;

    if (!user) {
      throw new WsException('Access denied: No user found in request.');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new WsException(
        `Access denied: You must have one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
