"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Category } from "@/types";
import { ChevronRight } from "lucide-react";

const GAME_ICONS: Record<string, string> = {
  lol:       "⚔️",
  valorant:  "🎯",
  freefire:  "🔥",
  lienquan:  "🛡️",
  genshin:   "✨",
  mlbb:      "🏆",
  pubg:      "🎮",
  cod:       "💣",
};

// Fallback mock categories for offline/dev
const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Liên Minh Huyền Thoại", slug: "lol",      icon: "lol",      filter_schema: [], accounts_count: 1234 },
  { id: 2, name: "VALORANT",             slug: "valorant",  icon: "valorant",  filter_schema: [], accounts_count: 856  },
  { id: 3, name: "Free Fire",            slug: "freefire",  icon: "freefire",  filter_schema: [], accounts_count: 2341 },
  { id: 4, name: "Liên Quân Mobile",    slug: "lienquan",  icon: "lienquan",  filter_schema: [], accounts_count: 987  },
  { id: 5, name: "Genshin Impact",       slug: "genshin",   icon: "genshin",   filter_schema: [], accounts_count: 432  },
  { id: 6, name: "Mobile Legends",       slug: "mlbb",      icon: "mlbb",      filter_schema: [], accounts_count: 673  },
];

export default function CategorySection() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/categories");
      return data.data as Category[];
    },
    placeholderData: MOCK_CATEGORIES,
    staleTime: 5 * 60 * 1000,
  });

  const list = categories ?? MOCK_CATEGORIES;

  return (
    <section className="container-main py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Danh mục game</h2>
          <p className="text-sm text-[#8b9ab5] mt-1">Chọn tựa game bạn muốn mua tài khoản</p>
        </div>
        <Link href="/accounts" className="btn-secondary text-sm py-2">
          Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {list.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/accounts?category_id=${cat.id}`}
            className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl border border-white/7 bg-[#141920] card-hover text-center"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a2030] to-[#0f1318] border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
              {GAME_ICONS[cat.slug] ?? "🎮"}
            </div>

            <div>
              <p className="text-sm font-semibold text-white leading-tight group-hover:text-blue-300 transition-colors">
                {cat.name}
              </p>
              {cat.accounts_count != null && (
                <p className="text-xs text-[#4a5568] mt-0.5">
                  {cat.accounts_count.toLocaleString()} acc
                </p>
              )}
            </div>

            {/* Hover glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
          </Link>
        ))}
      </div>
    </section>
  );
}
