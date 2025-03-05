import { Request } from 'express';

interface PaginationUrls {
  next: string | null;
  previous: string | null;
}

export function getPaginationUrls(
  req: Request,
  page: number,
  limit: number,
  count: number,
): PaginationUrls {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const protocol = req.protocol;
  const host = req.get('host');

  const baseUrl = `${protocol}://${host}${req.path}`;

  const next =
    endIndex < count ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null;

  const previous =
    startIndex > 0 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null;

  return { next, previous };
}
