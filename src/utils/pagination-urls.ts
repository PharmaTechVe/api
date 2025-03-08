import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

type PaginationUrls = {
  next: string | null;
  previous: string | null;
};

const configService = new ConfigService();

export function getPaginationUrls(
  req: Request,
  page: number,
  limit: number,
  count: number,
): PaginationUrls {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const api = configService.get<string>('API_URL');

  const baseUrl = `${api}${req.path}`;

  const next =
    endIndex < count ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null;

  const previous =
    startIndex > 0 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null;

  return { next, previous };
}
