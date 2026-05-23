import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Transaction, TransactionStatus, ApiResponse, PaginatedResponse } from "@/types";

export const transactionKeys = {
  all:   () => ["transactions"] as const,
  lists: () => [...transactionKeys.all(), "list"] as const,
  list:  (status?: TransactionStatus) => [...transactionKeys.lists(), { status }] as const,
  detail:(id: number) => [...transactionKeys.all(), "detail", id] as const,
};

// ── Buyer's transactions ──────────────────────────────────────────────
export function useMyTransactions(status?: TransactionStatus) {
  return useQuery({
    queryKey: transactionKeys.list(status),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Transaction>>(
        "/transactions",
        { params: status ? { status } : {} }
      );
      return data.data;
    },
  });
}

// ── Single transaction ────────────────────────────────────────────────
export function useTransaction(id: number) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Transaction>>(
        `/transactions/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

// ── Create (Buy Now) ──────────────────────────────────────────────────
export function useBuyAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gameAccountId: number) => {
      const { data } = await apiClient.post<ApiResponse<Transaction>>(
        "/transactions",
        { game_account_id: gameAccountId }
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

// ── Seller confirms delivery ──────────────────────────────────────────
export function useConfirmDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.patch<ApiResponse<Transaction>>(
        `/transactions/${id}/confirm-delivery`
      );
      return data.data;
    },
    onSuccess: (tx) => {
      qc.invalidateQueries({ queryKey: transactionKeys.detail(tx.id) });
      qc.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

// ── Buyer completes transaction ───────────────────────────────────────
export function useCompleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.patch<ApiResponse<Transaction>>(
        `/transactions/${id}/complete`
      );
      return data.data;
    },
    onSuccess: (tx) => {
      qc.invalidateQueries({ queryKey: transactionKeys.detail(tx.id) });
      qc.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

// ── Dispute ───────────────────────────────────────────────────────────
export function useDisputeTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const { data } = await apiClient.post<ApiResponse<Transaction>>(
        `/transactions/${id}/dispute`,
        { reason }
      );
      return data.data;
    },
    onSuccess: (tx) => {
      qc.invalidateQueries({ queryKey: transactionKeys.detail(tx.id) });
    },
  });
}
