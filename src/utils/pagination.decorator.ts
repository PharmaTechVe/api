import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationRequest } from './pagination-request.interface'; // asegúrate de que la ruta sea correcta
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationQueryDTO => {
    const request = ctx.switchToHttp().getRequest<PaginationRequest>();
    if (!request.pagination) {
      throw new Error('No pagination information was found in the request.');
    }
    return request.pagination;
  },
);
