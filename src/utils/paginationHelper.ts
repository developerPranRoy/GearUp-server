// Whitelisted sort fields — prevents prototype-pollution via orderBy injection
const ALLOWED_SORT_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "name",
  "pricePerDay",
  "totalStock",
  "availableStock",
]);

const ALLOWED_SORT_ORDERS = new Set(["asc", "desc"]);

export type PaginationResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export type PaginationOptions = {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: string;
};

const calculatePagination = (options: PaginationOptions): PaginationResult => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
  const skip = (page - 1) * limit;

  const sortBy = ALLOWED_SORT_FIELDS.has(options.sortBy ?? "")
    ? (options.sortBy as string)
    : "createdAt";

  const sortOrder = ALLOWED_SORT_ORDERS.has(options.sortOrder ?? "")
    ? (options.sortOrder as "asc" | "desc")
    : "desc";

  return { page, limit, skip, sortBy, sortOrder };
};

export const paginationHelpers = { calculatePagination };
