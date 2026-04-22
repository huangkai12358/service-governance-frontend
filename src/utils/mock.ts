import type { ApiResponse, PageQuery, PageResult } from '@/types/common';

export function success<T>(data: T, message = 'success'): ApiResponse<T> {
  return {
    code: 0,
    message,
    data
  };
}

export function wait<T>(data: T, timeout = 300): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), timeout);
  });
}

export function paginate<T>(list: T[], query: PageQuery): PageResult<T> {
  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize;
  return {
    list: list.slice(start, end),
    total: list.length,
    page: query.page,
    pageSize: query.pageSize
  };
}
