export * from './types/config';
export * from './types/responses';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface SearchOptions {
  query: string;
  type?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
