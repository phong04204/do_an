// ============================================================
// Core Types for Game Account Trading Platform
// ============================================================

export type UserRole = "admin" | "seller" | "buyer";

export type AccountStatus = "pending" | "approved" | "sold" | "rejected";

export type TransactionStatus =
  | "pending"
  | "paid"
  | "delivered"
  | "completed"
  | "disputed"
  | "refunded";

// ---- User ----
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  phone?: string;
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
  is_favorited?: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Transaction ----
export interface Transaction {
  id: number;
  buyer_id: number;
  seller_id: number;
  game_account_id: number;
  amount: number;
  status: TransactionStatus;
  note?: string;
  delivered_at?: string;
  completed_at?: string;
  escrow_released_at?: string;
  buyer?: User;
  seller?: User;
  game_account?: GameAccount;
  created_at: string;
  updated_at: string;
}

// ---- Complaint ----
export type ComplaintStatus = "open" | "investigating" | "resolved" | "rejected";
export interface Complaint {
  id: number;
  transaction_id: number;
  reporter_id: number;
  reason: string;
  status: ComplaintStatus;
  admin_note?: string;
  reporter?: User;
  transaction?: Transaction;
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
