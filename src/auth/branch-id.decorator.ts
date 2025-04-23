import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    branch?: { id: string };
  };
}

export const BranchId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const branchId = request.user?.branch?.id;

    if (!branchId) {
      throw new UnauthorizedException(
        'Access denied: Branch ID not found in request.',
      );
    }

    return branchId;
  },
);
