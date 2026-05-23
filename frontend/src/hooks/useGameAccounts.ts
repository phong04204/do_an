import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import {
  GameAccount,
  AccountFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types";

// ── Keys ─────────────────────────────────────────────────────────────
export const accountKeys = {
  all:    () => ["game-accounts"] as const,
  lists:  () => [...accountKeys.all(), "list"] as const,
  list:   (filters: AccountFilters) => [...accountKeys.lists(), filters] as const,
  detail: (id: number) => [...accountKeys.all(), "detail", id] as const,
  mine:   () => [...accountKeys.all(), "mine"] as const,
};

// ── Fetch list ────────────────────────────────────────────────────────
export function useGameAccounts(filters: AccountFilters = {}) {
  return useQuery({
    queryKey: accountKeys.list(filters),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<GameAccount>>(
        "/game-accounts",
        { params: filters }
      );
      return data.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

// ── Fetch single ──────────────────────────────────────────────────────
export function useGameAccount(id: number) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<GameAccount>>(
        `/game-accounts/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

// ── Seller's own accounts ─────────────────────────────────────────────
export function useMyAccounts() {
  return useQuery({
    queryKey: accountKeys.mine(),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<GameAccount>>(
        "/game-accounts/my"
      );
      return data.data;
    },
  });
}

// ── Create ────────────────────────────────────────────────────────────
export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post<ApiResponse<GameAccount>>(
        "/game-accounts",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.lists() });
      qc.invalidateQueries({ queryKey: accountKeys.mine() });
    },
  });
}

// ── Update ────────────────────────────────────────────────────────────
export function useUpdateAccount(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      formData.append("_method", "PUT");
      const { data } = await apiClient.post<ApiResponse<GameAccount>>(
        `/game-accounts/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.detail(id) });
      qc.invalidateQueries({ queryKey: accountKeys.mine() });
    },
  });
}

// ── Delete ────────────────────────────────────────────────────────────
export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/game-accounts/${id}`);
      return id;
    },
    onSuccess: (id) => {
      qc.removeQueries({ queryKey: accountKeys.detail(id) });
      qc.invalidateQueries({ queryKey: accountKeys.mine() });
    },
  });
}
