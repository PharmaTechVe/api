import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class UserValidatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: { user: User } = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied: No user found in request.');
    }

    if (user.isValidated) {
      return true;
    }

    throw new ForbiddenException('Access denied: Your are not validated.');
  }
}
