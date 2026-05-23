"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, LoginCredentials, RegisterCredentials } from "@/types";
import apiClient, { getErrorMessage } from "@/lib/api-client";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.post("/auth/login", credentials);
          const responsePayload = data.data || data;
          const { user, token } = responsePayload || {};

          if (!token || !user) {
            throw new Error(data?.message || "Không thể lấy thông tin đăng nhập.");
          }

          localStorage.setItem("auth_token", token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ error: getErrorMessage(err), isLoading: false });
          throw err;
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.post("/auth/register", credentials);
          const responsePayload = data.data || data;
          const { user, token } = responsePayload || {};

          if (!token || !user) {
            throw new Error(data?.message || "Không thể lấy thông tin đăng ký.");
          }

          localStorage.setItem("auth_token", token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ error: getErrorMessage(err), isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await apiClient.post("/auth/logout");
        } catch {
          // silently fail
        } finally {
          localStorage.removeItem("auth_token");
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const { data } = await apiClient.get("/auth/me");
          const user = data.data || data;
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem("auth_token");
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
