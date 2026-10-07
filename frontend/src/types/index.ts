// ============================================================
// Core Types for Game Account Trading Platform
// ============================================================

export type UserRole = "admin" | "buyer";

export type AccountStatus = "pending" | "approved" | "sold" | "rejected";

// ---- User ----
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  phone?: string;
  dob?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

// ---- Category ----
export interface FilterField {
  key: string;
  label: string;
  type: "select" | "range" | "checkbox" | "text";
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  unit?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  banner?: string;
  description?: string;
  filter_schema: FilterField[];
  accounts_count?: number;
}

// ---- Game Account ----
export interface GameAccount {
  id: number;
  seller_id: number;
  category_id: number;
  title: string;
  description?: string;
  price: number;
  rank?: string;
  level?: number;
  attributes: Record<string, string | number | boolean>;
  images: string[];
  status: AccountStatus;
  view_count: number;
  seller?: User;
  category?: Category;
  created_at: string;
  updated_at: string;
}

// ---- API Responses ----
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// ---- Filters ----
export interface AccountFilters {
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  rank?: string;
  min_level?: number;
  max_level?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "popular";
  page?: number;
  per_page?: number;
  [key: string]: string | number | undefined;
}

// ---- Auth ----
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: UserRole;
  phone?: string;
  dob?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
