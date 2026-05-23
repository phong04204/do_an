"use client";
import Link from "next/link";
import { useGameAccounts } from "@/hooks/useGameAccounts";
import GameAccountCard from "@/components/accounts/GameAccountCard";
import { ChevronRight, Sparkles } from "lucide-react";

// Skeleton loader
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/7 bg-[#141920] overflow-hidden">
      <div className="aspect-[16/10] skeleton" />
      <div className="p-3.5 space-y-3">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="flex justify-between items-center mt-2">
          <div className="skeleton h-6 w-24 rounded" />
          <div className="skeleton h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedAccounts() {
  const { data, isLoading } = useGameAccounts({ sort: "popular", per_page: 8 });
  const accounts = data?.data ?? [];

  return (
    <section className="container-main py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Tài khoản nổi bật</h2>
            <p className="text-sm text-[#8b9ab5] mt-0.5">Được mua nhiều nhất trong tuần</p>
          </div>
        </div>
        <Link href="/accounts" className="btn-secondary text-sm py-2 hidden sm:flex">
          Xem thêm <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
          : accounts.length > 0
          ? accounts.map((acc, i) => (
              <div key={acc.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <GameAccountCard account={acc} featured={i < 2} />
              </div>
            ))
          : (
            // Fallback mock data for dev/offline
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <GameAccountCard
                  account={{
                    id: i + 1,
                    seller_id: 1,
                    category_id: 1,
                    title: `Tài khoản Liên Minh - ${["Thách Đấu", "Cao Thủ", "Kim Cương", "Bạch Kim"][i % 4]}`,
                    price: [250000, 450000, 800000, 1200000, 350000, 600000, 950000, 1500000][i],
                    rank: ["Challenger", "Master", "Diamond", "Platinum", "Gold", "Diamond", "Master", "Challenger"][i],
                    level: 30 + i * 5,
                    images: [],
                    attributes: { skins: 20 + i * 10, champions: 50 + i * 5 },
                    status: "approved",
                    view_count: 100 + i * 50,
                    category: { id: 1, name: "Liên Minh Huyền Thoại", slug: "lol", icon: "lol", filter_schema: [] },
                    is_favorited: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }}
                  featured={i < 2}
                />
              </div>
            ))
          )
        }
      </div>

      <div className="text-center mt-8 sm:hidden">
        <Link href="/accounts" className="btn-secondary text-sm">
          Xem tất cả tài khoản <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
