import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationInputDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  pageSize?: number;
}

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
