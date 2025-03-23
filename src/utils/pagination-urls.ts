type PaginationURL = {
  next: string | null;
  previous: string | null;
};

export function getPaginationUrl(
  baseUrl: string,
  page: number,
  limit: number,
  count: number,
): PaginationURL {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const next =
    endIndex < count ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null;

  const previous =
    startIndex > 0 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null;

  return { next, previous };
}
