import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  PaginationDTO,
  PaginationQueryDTO,
} from 'src/utils/dto/pagination.dto';
import { PaginationRequest } from './pagination-request.interface';
import { getPaginationUrl } from 'src/utils/pagination-urls';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

@Injectable()
export class PaginationInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<PaginationDTO<T>> {
    const req = context.switchToHttp().getRequest<PaginationRequest>();
    const paginationQuery = plainToInstance(PaginationQueryDTO, req.query);
    const errors = validateSync(paginationQuery);

    if (errors.length > 0) {
      throw new Error(
        `Invalid pagination parameters: ${errors.map((err) => err.toString()).join(', ')}`,
      );
    }

    req.pagination = paginationQuery;
    const { page, limit } = paginationQuery;
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;

    return next.handle().pipe(
      map((result: { data: T[]; total: number }) => {
        const { data, total } = result;
        const { next: nextUrl, previous } = getPaginationUrl(
          baseUrl,
          page,
          limit,
          total,
        );
        return {
          results: data,
          count: total,
          next: nextUrl,
          previous,
        };
      }),
    );
  }
}
