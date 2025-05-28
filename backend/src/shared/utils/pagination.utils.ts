export class PaginationOutputDto<T> {
  data: T[];
  page: number;
  totalPages: number;
}

export function buildPagination<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginationOutputDto<T> {
  return {
    data,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}
