"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Calendar,
  CreditCard,
  ShieldCheck,
  Search,
  ArrowRight
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import apiClient from "@/lib/api-client";

interface OrderItem {
  id: number;
  price: string;
  purchasable_type: string;
  purchasable_id: number;
  purchasable_title: string;
  delivered_data: any;
}

interface Order {
  id: number;
  payment_transaction_id: string;
  total_amount: string;
  payment_method: "momo" | "zalopay" | "vnpay";
  status: "pending" | "completed" | "failed";
  created_at: string;
  items: OrderItem[];
}

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + "đ";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function PurchaseHistoryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<{ [key: number]: boolean }>({});
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push("/login?redirect=/lich-su-mua-hang");
      return;
    }

    // Fetch order history from backend
    apiClient.get("/orders")
      .then((res) => {
        setOrders(res.data.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch order history:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [mounted, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div className="skeleton animate-pulse" style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 1rem", background: "var(--primary)", opacity: 0.7 }} />
          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text)" }}>Đang tải lịch sử mua hàng...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "1rem" }}>Yêu cầu đăng nhập</h2>
          <p>Đang chuyển hướng sang trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  const toggleExpandOrder = (orderId: number) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getDeliveredFields = (delivery: any) => {
    if (delivery.type === "card") {
      return [
        { label: "Số Serial Thẻ", value: delivery.serial, isCopy: true, isPassword: false },
        { label: "Mã PIN / Code Thẻ", value: delivery.code, isCopy: true, isPassword: true }
      ].filter(f => f.value);
    } else if (delivery.type === "giftcode") {
      return [
        { label: "Mã Giftcode", value: delivery.code, isCopy: true, isPassword: false }
      ].filter(f => f.value);
    } else {
      return [
        { label: "Tên đăng nhập (Username)", value: delivery.username, isCopy: true, isPassword: false },
        { label: "Mật khẩu (Password)", value: delivery.password, isCopy: true, isPassword: true }
      ].filter(f => f.value);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = 
      order.payment_transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.purchasable_title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span style={{ 
            fontSize: "0.75rem", background: "rgba(16,185,129,0.12)", color: "#10B981", 
            fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "9999px" 
          }}>Thành công</span>
        );
      case "pending":
        return (
          <span style={{ 
            fontSize: "0.75rem", background: "rgba(245,158,11,0.12)", color: "#F59E0B", 
            fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "9999px" 
          }}>Chờ xử lý</span>
        );
      case "failed":
        return (
          <span style={{ 
            fontSize: "0.75rem", background: "rgba(239,68,68,0.12)", color: "#EF4444", 
            fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "9999px" 
          }}>Thất bại</span>
        );
    }
  };

  const getPaymentMethodName = (method: Order["payment_method"]) => {
    switch (method) {
      case "vnpay": return "VNPay";
      case "momo": return "Ví MoMo";
      case "zalopay": return "Ví ZaloPay";
      default: return method;
    }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "90vh", padding: "3rem 0 6rem" }}>
      <div className="container-main animate-fade-in" style={{ maxWidth: "1000px" }}>
        
        {/* Title Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: "2.25rem", fontWeight: 900, marginBottom: "0.5rem" }}>
              Lịch Sử Mua Hàng
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Quản lý và xem lại thông tin tài khoản, mã thẻ đã mua tại GameAcc Shop.
            </p>
          </div>
          <ShoppingBag style={{ width: "36px", height: "36px", color: "var(--primary)", opacity: 0.8 }} />
        </div>

        {/* Filters and search Bar */}
        <div className="card" style={{ 
          padding: "1.25rem", background: "var(--bg-card)", marginBottom: "2rem",
          display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between"
        }}>
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[
              { id: "all", label: "Tất cả" },
              { id: "completed", label: "Thành công" },
              { id: "pending", label: "Chờ xử lý" },
              { id: "failed", label: "Thất bại" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                style={{
                  padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 700, borderRadius: "8px",
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: statusFilter === tab.id ? "var(--primary)" : "var(--bg-soft)",
                  color: statusFilter === tab.id ? "#fff" : "var(--text-muted)"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: "relative", minWidth: "260px" }}>
            <Search style={{ 
              position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", 
              width: "16px", height: "16px", color: "var(--text-muted)" 
            }} />
            <input 
              type="text" 
              placeholder="Tìm mã đơn hoặc tên nick..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "0.5rem 1rem 0.5rem 2.25rem", border: "1.5px solid var(--border)",
                borderRadius: "8px", outline: "none", background: "var(--bg-soft)", color: "var(--text)", fontSize: "0.85rem"
              }}
            />
          </div>
        </div>

        {/* Orders Stack */}
        {filteredOrders.length === 0 ? (
          <div className="card" style={{ padding: "4rem 2rem", textAlign: "center", background: "var(--bg-card)" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🛒</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.75rem" }}>Không tìm thấy đơn hàng nào!</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "360px", margin: "0 auto 1.5rem" }}>
              Bạn chưa mua đơn hàng nào tương ứng, hoặc từ khóa tìm kiếm không chính xác. Hãy ghé thăm cửa hàng để chọn ngay các tài khoản game cực chất!
            </p>
            <Link href="/san-pham" className="btn-primary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.875rem" }}>
              Đến Cửa Hàng <ArrowRight style={{ width: "16px", height: "16px", marginLeft: "4px" }} />
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {filteredOrders.map((order) => {
              const isExpanded = !!expandedOrders[order.id];
              return (
                <div key={order.id} className="card" style={{ 
                  background: "var(--bg-card)", border: isExpanded ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                  borderRadius: "14px", overflow: "hidden", transition: "border 0.2s" 
                }}>
                  {/* Order summary row click to toggle */}
                  <div 
                    onClick={() => toggleExpandOrder(order.id)}
                    style={{ 
                      padding: "1.25rem 1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", 
                      alignItems: "center", gap: "1rem", cursor: "pointer", background: isExpanded ? "var(--bg-soft)" : "transparent"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      {/* Left Block */}
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>MÃ ĐƠN HÀNG</div>
                        <div style={{ fontWeight: 800, color: "var(--text)", fontFamily: "monospace", fontSize: "0.95rem" }}>{order.payment_transaction_id}</div>
                      </div>

                      <div style={{ width: "1px", height: "28px", background: "var(--border-light)", display: "block" }} className="divider-vert" />

                      {/* Created date block */}
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>NGÀY MUA</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <Calendar style={{ width: "14px", height: "14px", color: "var(--text-light)" }} /> {formatDate(order.created_at)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      {/* Price Block */}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>TỔNG THANH TOÁN</div>
                        <div style={{ fontWeight: 900, color: "var(--primary)", fontSize: "1.1rem" }}>{formatPrice(parseFloat(order.total_amount))}</div>
                      </div>

                      <div style={{ width: "1px", height: "28px", background: "var(--border-light)", display: "block" }} className="divider-vert" />

                      {/* Status and chevron */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {getStatusBadge(order.status)}
                        {isExpanded ? <ChevronUp style={{ width: "20px", height: "20px", color: "var(--text-light)" }} /> : <ChevronDown style={{ width: "20px", height: "20px", color: "var(--text-light)" }} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail section */}
                  {isExpanded && (
                    <div style={{ 
                      padding: "1.5rem", borderTop: "1px solid var(--border-light)", 
                      background: "rgba(0,0,0,0.01)", display: "flex", flexDirection: "column", gap: "1.5rem" 
                    }}>
                      
                      {/* Products list within order */}
                      <div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Sản phẩm đã mua ({order.items.length})
                        </h4>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          {order.items.map((item) => (
                            <div key={item.id} style={{ 
                              padding: "0.75rem 1rem", borderRadius: "8px", background: "var(--bg-soft)", 
                              border: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" 
                            }}>
                              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{item.purchasable_title}</span>
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>{formatPrice(parseFloat(item.price))}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment info block */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px dashed var(--border-light)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.825rem", color: "var(--text-muted)" }}>
                          <CreditCard style={{ width: "16px", height: "16px" }} /> 
                          Phương thức thanh toán: <strong style={{ color: "var(--text)" }}>{getPaymentMethodName(order.payment_method)}</strong>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.825rem", color: "var(--text-muted)" }}>
                          <ShieldCheck style={{ width: "16px", height: "16px", color: "#10B981" }} /> 
                          Bàn giao tự động: <strong style={{ color: "#10B981" }}>Đã kích hoạt</strong>
                        </div>
                      </div>

                      {/* Decrypted credentials table - ONLY SHOW IF COMPLETED */}
                      {order.status === "completed" ? (
                        <div>
                          <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Thông tin bàn giao & Bảo mật
                          </h4>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {order.items.map((item) => {
                              const delivery = item.delivered_data;
                              if (!delivery || Object.keys(delivery).length === 0) {
                                return (
                                  <div key={item.id} style={{ 
                                    padding: "1rem", borderRadius: "10px", background: "rgba(245,158,11,0.05)", 
                                    border: "1px solid rgba(245,158,11,0.2)", fontSize: "0.825rem", color: "var(--text-muted)"
                                  }}>
                                    Đang đồng bộ hóa thông tin tài khoản từ người bán... Vui lòng kiểm tra lại sau ít phút hoặc liên hệ hỗ trợ.
                                  </div>
                                );
                              }

                              const fields = getDeliveredFields(delivery);
                              return (
                                <div key={item.id} className="card" style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", overflow: "hidden" }}>
                                  {/* Item Header */}
                                  <div style={{ background: "rgba(0,0,0,0.02)", padding: "0.6rem 1rem", borderBottom: "1px solid var(--border-light)", fontSize: "0.8rem", fontWeight: 700 }}>
                                    {item.purchasable_title}
                                  </div>
                                  
                                  {/* Fields list */}
                                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {fields.map((field, fIdx) => {
                                      const keyStr = `${order.id}-${item.id}-${fIdx}`;
                                      const isFieldPassword = field.isPassword && !showPassword[keyStr];
                                      return (
                                        <div key={fIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--border-light)", paddingBottom: "0.6rem" }}>
                                          <div>
                                            <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginBottom: "0.1rem" }}>{field.label}</div>
                                            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", fontFamily: "monospace" }}>
                                              {isFieldPassword ? "••••••••••••••••" : field.value}
                                            </div>
                                          </div>
                                          
                                          <div style={{ display: "flex", gap: "0.35rem" }}>
                                            {field.isPassword && (
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); togglePasswordVisibility(keyStr); }}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.2rem" }}
                                              >
                                                {showPassword[keyStr] ? <EyeOff style={{ width: "15px", height: "15px" }} /> : <Eye style={{ width: "15px", height: "15px" }} />}
                                              </button>
                                            )}
                                            {field.isCopy && (
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); handleCopy(field.value, keyStr); }}
                                                style={{ 
                                                  background: "none", border: "none", cursor: "pointer", 
                                                  color: copiedField === keyStr ? "#10B981" : "var(--text-muted)", 
                                                  padding: "0.2rem", display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.725rem"
                                                }}
                                              >
                                                {copiedField === keyStr ? <Check style={{ width: "13px", height: "13px" }} /> : <Copy style={{ width: "13px", height: "13px" }} />}
                                                {copiedField === keyStr ? "Đã copy" : "Copy"}
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        // If pending/failed
                        <div style={{ 
                          padding: "1rem", borderRadius: "10px", 
                          background: order.status === "pending" ? "rgba(245,158,11,0.05)" : "rgba(239,68,68,0.05)",
                          border: order.status === "pending" ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(239,68,68,0.2)",
                          fontSize: "0.825rem", color: order.status === "pending" ? "#F59E0B" : "#EF4444"
                        }}>
                          {order.status === "pending" ? (
                            <span>Hóa đơn này hiện đang chờ thanh toán (VNPay / Chuyển khoản QR). Hãy hoàn tất giao dịch để tự động mở khóa các thông tin bàn giao an toàn trên!</span>
                          ) : (
                            <span>Hóa đơn này ở trạng thái thất bại hoặc đã bị hủy bỏ. Vui lòng thử lại giao dịch khác để nhận nick.</span>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
