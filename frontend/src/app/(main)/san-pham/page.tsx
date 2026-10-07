"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
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
  if (t.includes("fc online") || t.includes("fo4")) return "FC Online";
  if (t.includes("roblox") || t.includes("blox fruit")) return "Roblox";
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
  if (t.includes("viettel")) return "Thẻ Viettel";
  if (t.includes("mobifone") || t.includes("mobi")) return "Thẻ Mobifone";
  if (t.includes("vinaphone") || t.includes("vina")) return "Thẻ VinaPhone";
  return "Thẻ Game";
}

function inferGCCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("valorant")) return "VALORANT";
  if (t.includes("free fire")) return "Free Fire";
  if (t.includes("genshin")) return "Genshin Impact";
  if (t.includes("liên quân")) return "Liên Quân";
  if (t.includes("pubg")) return "PUBG Mobile";
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
    image: Array.isArray(c.images) && c.images.length > 0 ? c.images[0] : IMG_CARD,
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
    image: Array.isArray(g.images) && g.images.length > 0 ? g.images[0] : IMG_GC,
    price: Number(g.price),
    category: inferGCCategory(g.title),
    type: "Giftcode game",
    product_type: "giftcode" as const,
  }));
}

// ── Static constants ──────────────────────────────────────────────────────
const PRODUCT_TYPES = [
  { id: "account",  label: "🎮 Tài khoản Game" },
  { id: "card",     label: "💳 Thẻ Cào Chiết Khấu" },
  { id: "giftcode", label: "🎁 Vật phẩm & Giftcode" },
];

const PRODUCT_CATEGORIES: Record<string, string[]> = {
  account:  ["Tất Cả", "Liên Minh", "VALORANT", "Free Fire", "Genshin Impact", "Liên Quân", "PUBG Mobile", "FC Online", "Roblox"],
  card:     ["Tất Cả", "Thẻ Garena", "Thẻ Zing VNG", "Thẻ Vcoin", "Thẻ Gate", "Thẻ Viettel", "Thẻ Mobifone", "Thẻ VinaPhone"],
  giftcode: ["Tất Cả", "VALORANT", "Free Fire", "Genshin Impact", "Liên Quân", "PUBG Mobile"],
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
  fconline:  "FC Online",
  roblox:    "Roblox",
  lienquan:  "Liên Quân",
  pubg:      "PUBG Mobile",
};

const SORT_OPTIONS = [
  { label: "Mặc định", value: "default" },
  { label: "Giá: Thấp đến Cao", value: "price_asc" },
  { label: "Giá: Cao đến Thấp", value: "price_desc" },
];

const PRICE_FILTERS = [
  { label: "Dưới 100.000đ",    min: 0,       max: 100000 },
  { label: "100.000đ - 500.000đ",  min: 100000,  max: 500000 },
  { label: "500.000đ - 1.000.000đ",   min: 500000,  max: 1000000 },
  { label: "Trên 1.000.000đ",     min: 1000000, max: 999999999 },
];

const PAGE_SIZE = 12;

function ProductListingContent() {
  const searchParams = useSearchParams();

  const [activeProductType, setActiveProductType] = useState<"account" | "card" | "giftcode">("account");
  const [activeCat, setActiveCat]       = useState("Tất Cả");
  const [sort, setSort]                 = useState("default");
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
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
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
      const qParam    = searchParams.get("q");

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

      if (qParam) {
        setSearch(qParam);
      }

      setPriceRange(null);
      setSelectedTypes([]);
      setPage(1);
    });
  }, [searchParams]);

  // Filter
  let filtered = allProducts.filter(p => {
    const matchType    = p.product_type === activeProductType;
    const matchCat     = activeCat === "Tất Cả" || p.category === activeCat;
    const matchSearch  = !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchPrice   = !priceRange || (p.price >= priceRange.min && p.price <= priceRange.max);
    const matchSubType = selectedTypes.length === 0 || selectedTypes.includes(p.type ?? "");
    return matchType && matchCat && matchSearch && matchPrice && matchSubType;
  });

  // Sort
  if (sort === "price_asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
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
    setSort("default");
    setPage(1);
  };

  const getHeaderInfo = () => {
    switch (activeProductType) {
      case "card":
        return {
          title: "Kho Thẻ Cào Game Chiết Khấu Cao",
          subtitle: "Thẻ Garena, Zing VNG, Vcoin, Gate, Viettel nạp tự động, chiết khấu lên đến 5%."
        };
      case "giftcode":
        return {
          title: "Vật Phẩm & Giftcode Độc Quyền",
          subtitle: "Giftcode skin hiếm, nguyên thạch, quân huy, kim cương kích hoạt tức thì sau 3 giây."
        };
      default:
        return {
          title: "Kho Sản Phẩm Tài Khoản Game",
          subtitle: "Kho acc Liên Quân, VALORANT, LMHT, Genshin Impact bảo mật mail trắng, bảo hành trọn đời."
        };
    }
  };

  const { title: headerTitle, subtitle: headerSubtitle } = getHeaderInfo();
  const hasActiveFilters = Boolean(search.trim() || activeCat !== "Tất Cả" || priceRange || selectedTypes.length > 0);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: "4rem" }}>
      {/* ── Top Header Banner ─────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(180deg, var(--footer-bg) 0%, var(--bg) 100%)",
        borderBottom: "1px solid var(--border-light)",
        padding: "3rem 1rem 2.25rem",
        textAlign: "center"
      }}>
        <div className="container-main" style={{ maxWidth: 1000 }}>
          <h1 style={{
            fontSize: "2.1rem", fontWeight: 900, color: "var(--text)",
            marginBottom: "0.5rem", letterSpacing: "-0.02em"
          }}>
            {headerTitle}
          </h1>
          <p style={{
            color: "var(--text-muted)", fontSize: "0.95rem",
            maxWidth: 620, margin: "0 auto 2rem", lineHeight: 1.6
          }}>
            {headerSubtitle}
          </p>

          {/* 3 Main Product Type Tabs */}
          <div style={{
            display: "inline-flex",
            background: "var(--bg-card)",
            padding: "5px",
            borderRadius: "16px",
            border: "1.5px solid var(--border-light)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            gap: "6px",
            flexWrap: "wrap",
            justifyContent: "center"
          }}>
            {PRODUCT_TYPES.map(t => {
              const active = activeProductType === t.id;
              const count = allProducts.filter(p => p.product_type === t.id).length;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveProductType(t.id as any);
                    setActiveCat("Tất Cả");
                    setPriceRange(null);
                    setSelectedTypes([]);
                    setPage(1);
                  }}
                  style={{
                    padding: "0.65rem 1.4rem",
                    borderRadius: "12px",
                    border: "none",
                    background: active ? "var(--primary)" : "transparent",
                    color: active ? "#fff" : "var(--text)",
                    fontWeight: 750,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: active ? "0 4px 15px rgba(124, 58, 237, 0.35)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span>{t.label}</span>
                  {!loading && (
                    <span style={{
                      fontSize: "0.72rem",
                      background: active ? "rgba(255,255,255,0.25)" : "var(--bg-soft)",
                      color: active ? "#fff" : "var(--text-muted)",
                      borderRadius: 999,
                      padding: "1px 8px",
                      fontWeight: 700
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Store Body ──────────────────────────────────── */}
      <div className="container-main" style={{ maxWidth: 1280, padding: "2rem 1rem 0" }}>
        {error && (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⚠️</div>
            <p style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "1.25rem" }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.65rem 1.5rem",
                borderRadius: "10px",
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Thử lại ngay
            </button>
          </div>
        )}

        {!error && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "270px 1fr",
            gap: "2rem",
            alignItems: "start"
          }}>
            {/* ── Left Sidebar Filter ── */}
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

            {/* ── Right Content Area ── */}
            <div>
              {/* Category Pills Header */}
              <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: "18px",
                padding: "1rem 1.25rem",
                marginBottom: "1.25rem",
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
              }}>
                <div style={{
                  fontSize: "0.78rem", fontWeight: 750, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.65rem"
                }}>
                  Danh Mục Game & Thẻ
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {PRODUCT_CATEGORIES[activeProductType].map(cat => {
                    const isSelected = activeCat === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => { setActiveCat(cat); setPage(1); }}
                        style={{
                          padding: "0.45rem 0.95rem",
                          borderRadius: "999px",
                          fontSize: "0.82rem",
                          fontWeight: isSelected ? 700 : 550,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          border: "1.5px solid",
                          borderColor: isSelected ? "var(--primary)" : "var(--border-light)",
                          background: isSelected ? "rgba(124, 58, 237, 0.1)" : "var(--bg-soft)",
                          color: isSelected ? "var(--primary)" : "var(--text)"
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* In-Store Search & Sort Toolbar */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: "1.25rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: "16px",
                padding: "0.75rem 1rem",
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
              }}>
                {/* Search in Store */}
                <div style={{ position: "relative", flex: 1, minWidth: "220px", maxWidth: "420px" }}>
                  <Search style={{
                    position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                    width: "16px", height: "16px", color: "var(--text-muted)"
                  }} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Tìm theo tên sản phẩm, rank, mã..."
                    style={{
                      width: "100%",
                      padding: "0.55rem 2rem 0.55rem 2.2rem",
                      borderRadius: "10px",
                      border: "1px solid var(--border-light)",
                      background: "var(--bg-soft)",
                      color: "var(--text)",
                      fontSize: "0.84rem",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                    onBlur={e => e.currentTarget.style.borderColor = "var(--border-light)"}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      style={{
                        position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                        padding: "2px", display: "flex", alignItems: "center"
                      }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  )}
                </div>

                {/* Right controls: Sort Dropdown & Count */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ArrowUpDown style={{ width: "14px", height: "14px", color: "var(--text-muted)" }} />
                    <select
                      value={sort}
                      onChange={(e) => { setSort(e.target.value); setPage(1); }}
                      style={{
                        padding: "0.5rem 0.85rem",
                        borderRadius: "10px",
                        border: "1px solid var(--border-light)",
                        background: "var(--bg-soft)",
                        color: "var(--text)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      {SORT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <span style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    background: "var(--bg-soft)",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "8px",
                    fontWeight: 600,
                    whiteSpace: "nowrap"
                  }}>
                    {filtered.length} sản phẩm
                  </span>
                </div>
              </div>

              {/* Active Filter Badges */}
              {hasActiveFilters && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 650 }}>Đang lọc:</span>

                  {search && (
                    <div style={{
                      padding: "0.25rem 0.65rem", borderRadius: "8px",
                      background: "rgba(124, 58, 237, 0.09)", color: "var(--primary)",
                      fontSize: "0.78rem", fontWeight: 650, display: "flex", alignItems: "center", gap: "5px"
                    }}>
                      Từ khóa: "{search}"
                      <X style={{ width: 13, height: 13, cursor: "pointer" }} onClick={() => setSearch("")} />
                    </div>
                  )}

                  {activeCat !== "Tất Cả" && (
                    <div style={{
                      padding: "0.25rem 0.65rem", borderRadius: "8px",
                      background: "rgba(124, 58, 237, 0.09)", color: "var(--primary)",
                      fontSize: "0.78rem", fontWeight: 650, display: "flex", alignItems: "center", gap: "5px"
                    }}>
                      {activeCat}
                      <X style={{ width: 13, height: 13, cursor: "pointer" }} onClick={() => setActiveCat("Tất Cả")} />
                    </div>
                  )}

                  {priceRange && (
                    <div style={{
                      padding: "0.25rem 0.65rem", borderRadius: "8px",
                      background: "rgba(124, 58, 237, 0.09)", color: "var(--primary)",
                      fontSize: "0.78rem", fontWeight: 650, display: "flex", alignItems: "center", gap: "5px"
                    }}>
                      {PRICE_FILTERS.find(f => f.min === priceRange.min && f.max === priceRange.max)?.label}
                      <X style={{ width: 13, height: 13, cursor: "pointer" }} onClick={() => setPriceRange(null)} />
                    </div>
                  )}

                  {selectedTypes.map(t => (
                    <div key={t} style={{
                      padding: "0.25rem 0.65rem", borderRadius: "8px",
                      background: "rgba(124, 58, 237, 0.09)", color: "var(--primary)",
                      fontSize: "0.78rem", fontWeight: 650, display: "flex", alignItems: "center", gap: "5px"
                    }}>
                      {t}
                      <X style={{ width: 13, height: 13, cursor: "pointer" }} onClick={() => toggleType(t)} />
                    </div>
                  ))}

                  <button
                    onClick={clearFilters}
                    style={{
                      background: "none", border: "none", color: "#EF4444",
                      fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                      padding: "0.25rem 0.5rem", borderRadius: "6px"
                    }}
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}

              {/* ── Product Grid or Empty State ── */}
              {loading ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "1.25rem"
                }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 18,
                        overflow: "hidden",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-light)",
                        height: 310
                      }}
                    >
                      <div style={{ height: 170, background: "var(--border-light)", animation: "pulse 1.5s ease-in-out infinite" }} />
                      <div style={{ padding: "1rem" }}>
                        <div style={{ height: 16, borderRadius: 6, background: "var(--border-light)", marginBottom: 10 }} />
                        <div style={{ height: 14, borderRadius: 6, background: "var(--border-light)", width: "50%", marginBottom: 16 }} />
                        <div style={{ height: 20, borderRadius: 6, background: "var(--border-light)", width: "70%" }} />
                      </div>
                    </div>
                  ))}
                  <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>
                </div>
              ) : paged.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "5rem 1.5rem",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "20px"
                }}>
                  <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🔍</div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.4rem" }}>
                    Không tìm thấy sản phẩm phù hợp
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 450, margin: "0 auto 1.5rem" }}>
                    Hãy thử đổi từ khóa tìm kiếm hoặc bấm nút bên dưới để xem lại toàn bộ kho sản phẩm.
                  </p>
                  <button
                    onClick={clearFilters}
                    style={{
                      padding: "0.65rem 1.6rem",
                      borderRadius: "10px",
                      background: "var(--primary)",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)"
                    }}
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "1.25rem",
                  marginBottom: "2.5rem"
                }}>
                  {paged.map(p => (
                    <ProductCard key={`${p.product_type}-${p.id}`} product={p} />
                  ))}
                </div>
              )}

              {/* ── Pagination ── */}
              {!loading && totalPages > 1 && (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "1.5rem"
                }}>
                  <button
                    className="page-btn"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
                  >
                    <ChevronLeft style={{ width: 18, height: 18 }} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`page-btn${p === page ? " active" : ""}`}
                      onClick={() => setPage(p)}
                      style={{
                        width: "38px", height: "38px", borderRadius: "10px",
                        border: "1px solid",
                        borderColor: p === page ? "var(--primary)" : "var(--border-light)",
                        background: p === page ? "var(--primary)" : "var(--bg-card)",
                        color: p === page ? "#fff" : "var(--text)",
                        fontWeight: 700, fontSize: "0.88rem", cursor: "pointer",
                        boxShadow: p === page ? "0 4px 12px rgba(124, 58, 237, 0.3)" : "none"
                      }}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    className="page-btn"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
                  >
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
    <Suspense fallback={
      <div style={{ padding: "10rem 0", textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "var(--primary)",
          animation: "spin 1s linear infinite", margin: "0 auto 1.25rem"
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>Đang tải sản phẩm...</div>
      </div>
    }>
      <ProductListingContent />
    </Suspense>
  );
}
