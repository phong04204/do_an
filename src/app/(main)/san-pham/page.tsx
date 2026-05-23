"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ProductCard, { Product } from "@/components/products/ProductCard";
import FilterSidebar from "@/components/products/FilterSidebar";
import apiClient from "@/lib/api-client";

// ── Category inference from title ─────────────────────────────────────────
function inferAccountCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("lmht") || t.includes("liên minh")) return "Liên Minh";
  if (t.includes("valorant")) return "VALORANT";
  if (t.includes("free fire")) return "Free Fire";
  if (t.includes("genshin")) return "Genshin Impact";
  if (t.includes("liên quân") || t.includes("aov")) return "Liên Quân";
  if (t.includes("pubg")) return "PUBG Mobile";
  return "Khác";
}

function inferCardCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("garena")) return "Thẻ Garena";
  if (t.includes("zing") || t.includes("vng")) return "Thẻ Zing VNG";
  if (t.includes("vcoin")) return "Thẻ Vcoin";
  if (t.includes("gate")) return "Thẻ Gate";
  return "Thẻ Game";
}

function inferGCCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("valorant")) return "VALORANT";
  if (t.includes("free fire")) return "Free Fire";
  if (t.includes("genshin")) return "Genshin Impact";
  return "Khác";
}

function inferAccountType(price: number): string {
  if (price < 100000) return "Giá Rẻ";
  if (price < 500000) return "Tầm Trung";
  if (price < 1000000) return "Rank Cao";
  return "VIP";
}

function inferCardType(price: number): string {
  if (price < 60000) return "Mệnh giá nhỏ";
  if (price < 160000) return "Mệnh giá trung";
  return "Mệnh giá lớn";
}

const IMG_ACCOUNT = "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80";
const IMG_CARD    = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80";
const IMG_GC      = "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=400&q=80";

function mapAccounts(data: any[]): Product[] {
  return data.map(a => ({
    id: a.id,
    name: a.title,
    image: Array.isArray(a.images) && a.images.length > 0 ? a.images[0] : IMG_ACCOUNT,
    price: Number(a.price),
    category: inferAccountCategory(a.title),
    type: inferAccountType(Number(a.price)),
    product_type: "account" as const,
  }));
}

function mapCards(data: any[]): Product[] {
  return data.map(c => ({
    id: c.id,
    name: c.title,
    image: IMG_CARD,
    price: Number(c.price),
    category: inferCardCategory(c.title),
    type: inferCardType(Number(c.price)),
    product_type: "card" as const,
  }));
}

function mapGiftcodes(data: any[]): Product[] {
  return data.map(g => ({
    id: g.id,
    name: g.title,
    image: IMG_GC,
    price: Number(g.price),
    category: inferGCCategory(g.title),
    type: "Giftcode game",
    product_type: "giftcode" as const,
  }));
}

// ── Static constants ──────────────────────────────────────────────────────
const PRODUCT_TYPES = [
  { id: "account",  label: "🎮 Tài khoản Game" },
  { id: "card",     label: "💳 Thẻ Cào Game" },
  { id: "giftcode", label: "🎁 Vật phẩm & Giftcode" },
];

const PRODUCT_CATEGORIES: Record<string, string[]> = {
  account:  ["Tất Cả", "Liên Minh", "VALORANT", "Free Fire", "Genshin Impact", "Liên Quân", "PUBG Mobile"],
  card:     ["Tất Cả", "Thẻ Garena", "Thẻ Zing VNG", "Thẻ Vcoin", "Thẻ Gate"],
  giftcode: ["Tất Cả", "VALORANT", "Free Fire", "Genshin Impact"],
};

const PRODUCT_TYPE_FILTERS: Record<string, string[]> = {
  account:  ["Giá Rẻ", "Tầm Trung", "Rank Cao", "VIP"],
  card:     ["Mệnh giá nhỏ", "Mệnh giá trung", "Mệnh giá lớn"],
  giftcode: ["Giftcode game"],
};

const CAT_MAPPING: Record<string, string> = {
  lol:       "Liên Minh",
  valorant:  "VALORANT",
  freefire:  "Free Fire",
  genshin:   "Genshin Impact",
  lienquan:  "Liên Quân",
  pubg:      "PUBG Mobile",
};

const SORT_OPTIONS = ["Mặc định", "Giá thấp đến cao", "Giá cao đến thấp"];
const PRICE_FILTERS = [
  { label: "Dưới 100k",    min: 0,       max: 100000 },
  { label: "100k - 500k",  min: 100000,  max: 500000 },
  { label: "500k - 1tr",   min: 500000,  max: 1000000 },
  { label: "Trên 1tr",     min: 1000000, max: 999999999 },
];

const PAGE_SIZE = 9;

function ProductListingContent() {
  const searchParams = useSearchParams();

  const [activeProductType, setActiveProductType] = useState<"account" | "card" | "giftcode">("account");
  const [activeCat, setActiveCat]       = useState("Tất Cả");
  const [sort, setSort]                 = useState("Mặc định");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [priceRange, setPriceRange]     = useState<{ min: number; max: number } | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // Fetch all products once
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [accRes, cardRes, gcRes] = await Promise.all([
          apiClient.get("/game-accounts"),
          apiClient.get("/game-cards"),
          apiClient.get("/game-giftcodes"),
        ]);
        setAllProducts([
          ...mapAccounts(accRes.data),
          ...mapCards(cardRes.data),
          ...mapGiftcodes(gcRes.data),
        ]);
      } catch {
        setError("Không thể tải sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Sync URL params → filters
  useEffect(() => {
    Promise.resolve().then(() => {
      const typeParam = searchParams.get("type");
      const catParam  = searchParams.get("cat");
      let targetType: "account" | "card" | "giftcode" = "account";
      if (typeParam === "card" || typeParam === "giftcode" || typeParam === "account") {
        targetType = typeParam;
      }
      setActiveProductType(targetType);
      if (catParam && CAT_MAPPING[catParam]) {
        setActiveProductType("account");
        setActiveCat(CAT_MAPPING[catParam]);
      } else {
        setActiveCat("Tất Cả");
      }
      setPriceRange(null);
      setSelectedTypes([]);
      setPage(1);
    });
  }, [searchParams]);

  // Filter
  let filtered = allProducts.filter(p => {
    const matchType   = p.product_type === activeProductType;
    const matchCat    = activeCat === "Tất Cả" || p.category === activeCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchPrice  = !priceRange || (p.price >= priceRange.min && p.price <= priceRange.max);
    const matchSubType = selectedTypes.length === 0 || selectedTypes.includes(p.type ?? "");
    return matchType && matchCat && matchSearch && matchPrice && matchSubType;
  });

  // Sort
  if (sort === "Giá thấp đến cao") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === "Giá cao đến thấp") filtered = [...filtered].sort((a, b) => b.price - a.price);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleType = (t: string) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    setPage(1);
  };

  const clearFilters = () => {
    setActiveCat("Tất Cả");
    setSearch("");
    setPriceRange(null);
    setSelectedTypes([]);
    setPage(1);
  };

  const getHeaderInfo = () => {
    switch (activeProductType) {
      case "card":     return { title: "Mua Thẻ Game Chiết Khấu Cao",     subtitle: "Kho thẻ Garena, Zing VNG, Vcoin, Gate nạp trực tiếp chiết khấu cao tốt nhất" };
      case "giftcode": return { title: "Vật Phẩm & Giftcode Game VIP",    subtitle: "Sở hữu rương súng, kim cương, nguyên thạch nạp giftcode nhận ngay sau 10 giây" };
      default:         return { title: "Cửa Hàng Tài Khoản Game",         subtitle: "Hệ thống mua bán acc game tự động, an toàn và bảo hành trọn đời 100%" };
    }
  };

  const { title: headerTitle, subtitle: headerSubtitle } = getHeaderInfo();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--footer-bg)", padding: "2.5rem 0 2.5rem", textAlign: "center", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container-main">
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text)", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
            {headerTitle}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
            {headerSubtitle}
          </p>

          {/* Type tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {PRODUCT_TYPES.map(t => {
              const active = activeProductType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setActiveProductType(t.id as any); setActiveCat("Tất Cả"); setPriceRange(null); setSelectedTypes([]); setPage(1); }}
                  style={{
                    padding: "0.7rem 1.4rem", borderRadius: "14px", border: "2px solid",
                    borderColor: active ? "var(--primary)" : "var(--border-light)",
                    background: active ? "rgba(124, 58, 237, 0.08)" : "var(--bg-soft)",
                    color: active ? "var(--text)" : "var(--text-muted)",
                    fontWeight: 750, fontSize: "0.9rem", cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: active ? "0 0 25px rgba(124, 58, 237, 0.2)" : "none",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                  }}
                >
                  {t.label}
                  {!loading && (
                    <span style={{ fontSize: "0.75rem", background: active ? "rgba(124,58,237,0.15)" : "rgba(0,0,0,0.06)", borderRadius: 99, padding: "1px 7px" }}>
                      {allProducts.filter(p => p.product_type === t.id).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container-main" style={{ padding: "2.5rem 1rem" }}>
        {/* Error state */}
        {error && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <p style={{ fontWeight: 600, marginBottom: "1rem" }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ color: "var(--primary)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
              Thử lại
            </button>
          </div>
        )}

        {!error && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "2.5rem", alignItems: "start" }}>
            <FilterSidebar
              priceFilters={PRICE_FILTERS}
              typeFilters={PRODUCT_TYPE_FILTERS[activeProductType]}
              currentPriceRange={priceRange}
              selectedTypes={selectedTypes}
              onPriceChange={(range) => { setPriceRange(range); setPage(1); }}
              onTypeToggle={toggleType}
              onClearAll={clearFilters}
              activeProductType={activeProductType}
            />

            <div>
              {/* Category pills */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                {PRODUCT_CATEGORIES[activeProductType].map(cat => (
                  <button
                    key={cat}
                    className={`cat-tab${activeCat === cat ? " active" : ""}`}
                    onClick={() => { setActiveCat(cat); setPage(1); }}
                  >
                    {cat}
                  </button>
                ))}
              </div>


              {/* Active filter chips */}
              {(priceRange || selectedTypes.length > 0) && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  {priceRange && (
                    <div style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", background: "rgba(124,58,237,0.1)", color: "var(--primary)", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      {PRICE_FILTERS.find(f => f.min === priceRange.min && f.max === priceRange.max)?.label}
                      <X style={{ width: 14, height: 14, cursor: "pointer" }} onClick={() => setPriceRange(null)} />
                    </div>
                  )}
                  {selectedTypes.map(t => (
                    <div key={t} style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", background: "rgba(124,58,237,0.1)", color: "var(--primary)", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      {t} <X style={{ width: 14, height: 14, cursor: "pointer" }} onClick={() => toggleType(t)} />
                    </div>
                  ))}
                </div>
              )}

              {/* Loading skeleton */}
              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: "var(--bg-soft)", border: "1px solid var(--border-light)" }}>
                      <div style={{ height: 200, background: "var(--border-light)", animation: "pulse 1.5s ease-in-out infinite" }} />
                      <div style={{ padding: "1rem" }}>
                        <div style={{ height: 14, borderRadius: 6, background: "var(--border-light)", marginBottom: 8 }} />
                        <div style={{ height: 14, borderRadius: 6, background: "var(--border-light)", width: "60%" }} />
                      </div>
                    </div>
                  ))}
                  <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
                </div>
              ) : paged.length === 0 ? (
                <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--text-light)" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎮</div>
                  <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Không tìm thấy sản phẩm phù hợp</p>
                  <button onClick={clearFilters} style={{ marginTop: "1rem", color: "var(--primary)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Hiển thị {paged.length} / {filtered.length} sản phẩm
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                    {paged.map(p => <ProductCard key={`${p.product_type}-${p.id}`} product={p} />)}
                  </div>
                </>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem", paddingBottom: "3rem" }}>
                  <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft style={{ width: 18, height: 18 }} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`page-btn${p === page ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                  <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <ChevronRight style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SanPhamPage() {
  return (
    <Suspense fallback={<div style={{ padding: "10rem 0", textAlign: "center", color: "var(--text-light)" }}>Đang tải cửa hàng...</div>}>
      <ProductListingContent />
    </Suspense>
  );
}
