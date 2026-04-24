export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_PAGE_LIMIT = 100;

export type Pagination = { limit: number; offset: number };

function clampInt(raw: string | null, fallback: number, max?: number) {
  if (raw === null) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return max !== undefined ? Math.min(parsed, max) : parsed;
}

export function parsePagination(params: URLSearchParams): Pagination {
  return {
    limit: clampInt(params.get("limit"), DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT),
    offset: clampInt(params.get("offset"), 0),
  };
}
