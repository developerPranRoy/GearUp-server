export type IGearFilterRequest = {
  searchTerm?: string;
  category?: string;
  brand?: string;
  status?: string;
  minPrice?: string;
  maxPrice?: string;
};

export type IGearCreateInput = {
  name: string;
  description?: string;
  brand?: string;
  pricePerDay: number;
  totalStock: number;
  images?: string[];
  categoryId: string;
};

export type IGearUpdateInput = {
  name?: string;
  description?: string;
  brand?: string;
  pricePerDay?: number;
  totalStock?: number;
  availableStock?: number;
  images?: string[];
  categoryId?: string;
  status?: "AVAILABLE" | "UNAVAILABLE";
};
