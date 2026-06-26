/**
 * Service Layer — Wild Peak Souls
 *
 * Abstract service interfaces that define the contract for data operations.
 * Concrete implementations will be provided in Phase 2 (database integration).
 * This structure allows the UI to be built against stable interfaces while
 * the backend implementation details are finalized later.
 */

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
