"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GameAccount } from "@/types";
import apiClient from "@/lib/api-client";

interface FavoritesState {
  favoriteIds: Set<number>;
  favorites: GameAccount[];
  isLoading: boolean;

  isFavorite: (id: number) => boolean;
  toggleFavorite: (account: Partial<GameAccount> & { id: number }) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  syncFromServer: (ids: number[]) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: new Set<number>(),
      favorites: [],
      isLoading: false,

      isFavorite: (id) => get().favoriteIds.has(id),

      toggleFavorite: async (account) => {
        const { favoriteIds, favorites } = get();
        const wasFav = favoriteIds.has(account.id);

        // Optimistic update
        const newIds = new Set(favoriteIds);
        let newFavs: GameAccount[];
        if (wasFav) {
          newIds.delete(account.id);
          newFavs = favorites.filter((f) => f.id !== account.id);
        } else {
          newIds.add(account.id);
          // If we have a full account object, add it. Otherwise just the ID is tracked.
          newFavs = account.title ? [...favorites, account as GameAccount] : favorites;
        }
        set({ favoriteIds: newIds, favorites: newFavs });

        // Sync with server
        try {
          if (wasFav) {
            await apiClient.delete(`/favorites/${account.id}`);
          } else {
            await apiClient.post("/favorites", { game_account_id: account.id });
          }
        } catch {
          // Rollback if needed, but for mock/offline we don't want to spam errors
          // set({ favoriteIds, favorites });
        }
      },

      fetchFavorites: async () => {
        set({ isLoading: true });
        try {
          const { data } = await apiClient.get("/favorites");
          const accs: GameAccount[] = data.data;
          set({
            favorites: accs,
            favoriteIds: new Set(accs.map((a) => a.id)),
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      syncFromServer: (ids) => {
        set({ favoriteIds: new Set(ids) });
      },
    }),
    {
      name: "favorites-store",
      partialize: (state) => ({
        favoriteIds: [...state.favoriteIds] as unknown as Set<number>,
        favorites: state.favorites,
      }),
      merge: (persisted: unknown, current) => {
        const p = persisted as { favoriteIds?: number[]; favorites?: GameAccount[] };
        return {
          ...current,
          favoriteIds: new Set<number>((p?.favoriteIds as number[]) ?? []),
          favorites: p?.favorites ?? [],
        };
      },
    }
  )
);
