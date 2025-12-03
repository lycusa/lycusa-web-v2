// Product Service Types

export enum ProductStatus {
  INACTIVE = "inactive",
  ACTIVE = "active",
}

export enum ProductType {
  READY_TO_SELL = "ready_to_sell",
  PRE_ORDER = "pre_order",
}

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

export enum ModerationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface Money {
  amount: number;
  currency: string;
}

export interface Media {
  id: string;
  url: string;
  type: MediaType;
  order: number;
  moderation_status?: ModerationStatus;
  created_at?: string;
  expires_at?: number;
}

export interface Product {
  id: string;
  seller_id: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  price: Money;
  category: string;
  tags: string[];
  product_type: ProductType;
  due_date: string | null;
  media: Media[];
  moderation_status: ModerationStatus;
  moderation_reason: string | null;
}

export interface CreateProductRequest {
  seller_id: string;
  name: string;
  description: string;
  price: Money;
  category: string;
  tags?: string[];
  product_type: ProductType;
  due_date?: string | null;
  media?: Media[];
}

export interface EditProductRequest {
  name?: string;
  description?: string;
  price?: Money;
  category?: string;
  tags?: string[];
  product_type?: ProductType;
  due_date?: string | null;
  media?: Media[];
}

export interface SearchQuery {
  query: string;
  categories?: string[];
  tags?: string[];
  min_price?: number;
  max_price?: number;
  currency?: string;
  product_type?: ProductType;
  status?: ProductStatus;
  page?: number;
  size?: number;
  sort_by?: "relevance" | "created_at" | "price" | "name";
  sort_order?: "asc" | "desc";
}

export interface SearchResultItem {
  id: string;
  seller_id: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  price: Money;
  category: string;
  tags: string[];
  product_type: ProductType;
  due_date: string | null;
  media_count: number;
  media_urls: string[];
  score: number;
}

export interface SearchResult {
  query: string;
  total_results: number;
  page: number;
  size: number;
  total_pages: number;
  results: SearchResultItem[];
  execution_time_ms: number;
  aggregations?: Record<string, any>;
}

export interface UploadMediaResponse {
  task_id: string;
  status_url: string;
}

export interface MediaInfo {
  id: string;
  url: string;
  type: MediaType;
  order: number;
  moderation_status: ModerationStatus;
  created_at: string;
  file_size?: number;
  content_type?: string;
}

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}
