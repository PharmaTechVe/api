import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { User, UserRole } from 'src/user/entities/user.entity';

@Injectable()
export class UserOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: { user: User; params: { userId: string } } = context
      .switchToHttp()
      .getRequest();
    const user: User = request.user;
    let paramUserId: string = request.params.userId;
    paramUserId = paramUserId.replace(/[{}]/g, '');

    if (!user) {
      throw new ForbiddenException('Access denied: No user found in request.');
    }

    if (user.role === UserRole.ADMIN || user.id === paramUserId) {
      return true;
    }

    throw new ForbiddenException(
      'Access denied: You are not allowed to access this profile.',
    );
  }
}
