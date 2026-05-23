"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, Zap, Star, ChevronRight, Eye } from "lucide-react";
import { GameAccount } from "@/types";
import { useFavoritesStore } from "@/store/favorites-store";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Rank color mapping
const RANK_COLORS: Record<string, string> = {
  iron:        "text-gray-400",
  bronze:      "text-yellow-700",
  silver:      "text-slate-300",
  gold:        "text-yellow-400",
  platinum:    "text-cyan-400",
  diamond:     "text-indigo-400",
  master:      "text-purple-400",
  grandmaster: "text-red-400",
  challenger:  "text-amber-400",
};

const getRankColor = (rank?: string) =>
  rank ? RANK_COLORS[rank.toLowerCase()] ?? "text-blue-400" : "text-blue-400";

interface Props {
  account: GameAccount;
  featured?: boolean;
}

export default function GameAccountCard({ account, featured = false }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const router = useRouter();
  const favorited = isFavorite(account.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { router.push("/login"); return; }
    toggleFavorite(account);
  };

  const imageUrl = account.images?.[0] ?? "/placeholder-account.jpg";
  const imageCount = account.images?.length ?? 0;

  return (
    <Link
      href={`/accounts/${account.id}`}
      className={cn(
        "group relative flex flex-col rounded-2xl border border-white/7 overflow-hidden card-hover",
        "bg-[#141920]",
        featured && "ring-1 ring-blue-500/20"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0f1318]">
        <Image
          src={imageUrl}
          alt={account.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-account.jpg"; }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141920] via-transparent to-transparent opacity-80" />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {featured && (
            <span className="badge badge-yellow">
              <Star className="w-2.5 h-2.5" /> Nổi bật
            </span>
          )}
          {account.status === "sold" && (
            <span className="badge badge-red">Đã bán</span>
          )}
          {account.status === "pending" && (
            <span className="badge badge-gray">Chờ duyệt</span>
          )}
        </div>

        {/* Image count */}
        {imageCount > 1 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 rounded-md px-2 py-0.5 text-xs text-white">
            <Eye className="w-3 h-3" />
            {imageCount}
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          aria-label={favorited ? "Bỏ yêu thích" : "Yêu thích"}
          className={cn(
            "absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-sm transition-all duration-200",
            favorited
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-black/40 text-white/60 border border-white/10 opacity-0 group-hover:opacity-100"
          )}
        >
          <Heart className={cn("w-3.5 h-3.5", favorited && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        {/* Title + category */}
        <div className="mb-2">
          <p className="text-xs text-[#4a5568] mb-0.5">{account.category?.name}</p>
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
            {account.title}
          </h3>
        </div>

        {/* Specs pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {account.rank && (
            <span className={cn("flex items-center gap-1 text-[11px] font-medium", getRankColor(account.rank))}>
              <Zap className="w-2.5 h-2.5" />
              {account.rank}
            </span>
          )}
          {account.level != null && (
            <span className="text-[11px] font-medium text-[#8b9ab5]">
              Lv.{account.level}
            </span>
          )}
          {account.attributes?.skins != null && (
            <span className="text-[11px] font-medium text-[#8b9ab5]">
              {account.attributes.skins} Skins
            </span>
          )}
          {account.attributes?.champions != null && (
            <span className="text-[11px] font-medium text-[#8b9ab5]">
              {account.attributes.champions} Tướng
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-white">
              {account.price.toLocaleString("vi-VN")}
              <span className="text-xs font-normal text-[#8b9ab5] ml-1">₫</span>
            </p>
          </div>
          <button
            className="flex items-center gap-1 btn-primary py-1.5 px-3 text-xs pointer-events-none"
            tabIndex={-1}
          >
            Mua ngay <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Link>
  );
}
