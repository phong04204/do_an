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
  fetchMe: (forcedToken?: string) => Promise<void>;
  setAuth: (token: string, user?: User | null) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
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

      setAuth: async (token: string, user?: User | null) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
        }
        set({ token, user: user || null, isAuthenticated: true });
        try {
          const { data } = await apiClient.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fetchedUser = data.data || data;
          set({ user: fetchedUser, token, isAuthenticated: true });
        } catch (e) {
          console.error("setAuth fetchMe error:", e);
        }
      },

      fetchMe: async (forcedToken?: string) => {
        const token = forcedToken || get().token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
        if (!token) return;
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", token);
          }
          const { data } = await apiClient.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const user = data.data || data;
          set({ user, token, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
          }
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.put("/auth/profile", profileData);
          const updatedUser = data.data || data;
          set({ user: updatedUser, isLoading: false });
        } catch (err) {
          set({ error: getErrorMessage(err), isLoading: false });
          throw err;
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
