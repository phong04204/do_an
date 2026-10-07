"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Copy, 
  Eye, 
  EyeOff, 
  Check, 
  Sparkles,
  XCircle
} from "lucide-react";
import { cartItemKey, useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import apiClient from "@/lib/api-client";

type DeliveredProduct = {
  id: number;
  name: string;
  type: "account" | "card" | "giftcode";
  username: string;
  password: string;
  email: string;
  backupCode: string;
  serial: string;
  code: string;
};

type OrderItemResponse = {
  id: number;
  purchasable_title?: string;
  delivered_data?: Partial<Omit<DeliveredProduct, "id" | "name">>;
};

type ApiError = {
  response?: { data?: { message?: string } };
  message?: string;
};

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + "đ";
}

function mapDeliveredAccounts(orderItems: OrderItemResponse[]): DeliveredProduct[] {
  return orderItems.map((item) => {
    const delivery = item.delivered_data || {};
    return {
      id: item.id,
      name: item.purchasable_title || "Sản phẩm",
      type: delivery.type || "account",
      username: delivery.username || "",
      password: delivery.password || "",
      email: delivery.email || "",
      backupCode: delivery.backupCode || "",
      serial: delivery.serial || "",
      code: delivery.code || "",
    };
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});
  const [orderIdState, setOrderIdState] = useState(() => "GAMEACC-" + Math.floor(100000 + Math.random() * 900000));
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deliveredAccounts, setDeliveredAccounts] = useState<DeliveredProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"vnpay">("vnpay");

  const { user, isAuthenticated } = useAuthStore();
  const { items, buyNowItem, setBuyNowItem, clearCart } = useCartStore();
  const checkoutItems = buyNowItem ? [buyNowItem] : items;

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);

  // Enforce login
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [mounted, isAuthenticated, router]);

  // VNPay callback handler
  useEffect(() => {
    if (!mounted) return;
    
    const params = new URLSearchParams(window.location.search);
    const vnpaySuccess = params.get("vnpay_success") === "true";
    const vnpayFailed = params.get("vnpay_failed") === "true";
    const orderIdParam = params.get("order_id");

    if (vnpaySuccess && orderIdParam) {
      const loadPaidOrder = async () => {
        setIsLoading(true);
        if (buyNowItem) {
          setBuyNowItem(null);
        } else {
          clearCart();
        }
        try {
          const res = await apiClient.get(`/orders/${orderIdParam}`);
          const orderData = res.data.data;
          setOrderIdState(orderData.payment_transaction_id);
          setDeliveredAccounts(mapDeliveredAccounts(orderData.items));
          setIsPaid(true);
        } catch (err) {
          console.error("Failed to fetch VNPay order details:", err);
          setErrorMessage("Không thể lấy chi tiết bàn giao tài khoản của đơn hàng. Vui lòng liên hệ hỗ trợ!");
        } finally {
          setIsLoading(false);
        }
      };

      void loadPaidOrder();
    } else if (vnpayFailed) {
      Promise.resolve().then(() => {
        setErrorMessage("Giao dịch thanh toán qua VNPay không thành công hoặc đã bị hủy. Vui lòng thử lại!");
        router.replace("/checkout");
      });
    }
  }, [mounted, clearCart, router]);

  if (!mounted || isLoading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div className="skeleton animate-pulse" style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 1rem", background: "var(--primary)", opacity: 0.7 }} />
          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text)" }}>Đang xử lý giao dịch... Vui lòng đợi trong giây lát</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>Yêu cầu đăng nhập</div>
          <p>Đang tự động chuyển hướng sang trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  // If cart is empty and not paid, redirect back to cart
  if (checkoutItems.length === 0 && !isPaid) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "1rem" }}>Bạn chưa chọn sản phẩm nào để thanh toán!</h2>
          <Link href="/san-pham" className="btn-primary">Quay lại cửa hàng</Link>
        </div>
      </div>
    );
  }

  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price, 0);
  const finalTotal = subtotal;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePasswordVisibility = (itemId: number) => {
    setShowPassword((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const getDeliveredFields = (acc: DeliveredProduct) => {
    if (acc.type === "card") {
      return [
        { label: "Số Serial Thẻ", value: acc.serial, isCopy: true, isPassword: false },
        { label: "Mã PIN / Code Thẻ", value: acc.code, isCopy: true, isPassword: true }
      ].filter(f => f.value);
    } else if (acc.type === "giftcode") {
      return [
        { label: "Mã Giftcode", value: acc.code, isCopy: true, isPassword: false }
      ].filter(f => f.value);
    } else {
      return [
        { label: "Tên đăng nhập (Username)", value: acc.username, isCopy: true, isPassword: false },
        { label: "Mật khẩu (Password)", value: acc.password, isCopy: true, isPassword: true }
      ].filter(f => f.value);
    }
  };

  const handlePaymentConfirm = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const orderPayload = {
        payment_method: paymentMethod,
        notes: "",
        items: checkoutItems.map(item => ({
          id: item.id,
          price: item.price,
          quantity: 1,
          product_type: item.product_type || "account"
        }))
      };

      const { data } = await apiClient.post("/orders", orderPayload);

      // Nếu chọn VNPay và có link thanh toán
      if (paymentMethod === "vnpay" && data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }

      // Nếu là thanh toán demo hoặc nhận kết quả order trực tiếp
      const orderData = data.order || data.data;
      if (orderData) {
        setOrderIdState(orderData.payment_transaction_id);
        setDeliveredAccounts(mapDeliveredAccounts(orderData.items));
        setIsPaid(true);
        if (buyNowItem) {
          setBuyNowItem(null);
        } else {
          clearCart();
        }
      }
    } catch (err: unknown) {
      console.error("Payment confirmation failed:", err);
      const error = err as ApiError;
      const errMsg = error.response?.data?.message || error.message || "Có lỗi xảy ra khi xác nhận thanh toán.";
      setErrorMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    if (buyNowItem) {
      setBuyNowItem(null);
    } else {
      clearCart();
    }
    router.push("/");
  };

  // ── SUCCESSFUL PAYMENT SCREEN ────────────────────────────────────────
  if (isPaid) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "3rem 0 5rem" }}>
        <div className="container-main animate-fade-in-up" style={{ maxWidth: "800px" }}>
          
          {/* Header Success Section */}
          <div className="card" style={{ 
            padding: "3rem 2rem", 
            textAlign: "center", 
            background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(124,58,237,0.05) 100%)",
            borderColor: "rgba(16,185,129,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            marginBottom: "2rem"
          }}>
            <div style={{ 
              width: "80px", height: "80px", borderRadius: "50%", 
              background: "#10B981", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)"
            }}>
              <CheckCircle2 style={{ width: "42px", height: "42px" }} />
            </div>

            <div>
              <h1 style={{ fontSize: "2.25rem", fontWeight: 900, background: "linear-gradient(135deg, #10B981, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", color: "transparent" }}>
                Thanh Toán Thành Công!
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
                Đơn hàng <strong style={{ color: "var(--text)" }}>{orderIdState}</strong> của bạn đã được duyệt tự động. Dưới đây là thông tin bàn giao tài khoản.
              </p>
            </div>

            <div style={{ 
              padding: "0.75rem 1.5rem", borderRadius: "8px", background: "var(--bg-soft)", 
              fontSize: "0.85rem", color: "var(--text-muted)", border: "1px solid var(--border-light)"
            }}>
              Một bản sao thông tin tài khoản và hóa đơn đã được gửi về email: <strong style={{ color: "var(--text)" }}>{user?.email}</strong>
            </div>
          </div>

          {/* Account Delivery Table */}
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles style={{ width: "20px", height: "20px", color: "var(--primary)" }} /> Thông Tin Tài Khoản Bàn Giao
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "3rem" }}>
            {deliveredAccounts.map((acc) => (
              <div key={acc.id} className="card" style={{ background: "var(--bg-card)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ 
                  background: "var(--bg-soft)", padding: "1rem 1.5rem", 
                  borderBottom: "1px solid var(--border-light)", display: "flex", 
                  justifyContent: "space-between", alignItems: "center" 
                }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{acc.name}</span>
                  <span style={{ fontSize: "0.75rem", background: "rgba(16,185,129,0.15)", color: "#10B981", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                    Bàn giao thành công
                  </span>
                </div>

                {/* Details list */}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {getDeliveredFields(acc).map((field, fIdx) => (
                    <div key={fIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--border-light)", paddingBottom: "0.75rem" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.15rem" }}>{field.label}</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)", fontFamily: "monospace" }}>
                          {field.isPassword && !showPassword[acc.id] ? "••••••••••••••" : field.value}
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {field.isPassword && (
                          <button 
                            onClick={() => togglePasswordVisibility(acc.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem" }}
                          >
                            {showPassword[acc.id] ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
                          </button>
                        )}
                        {field.isCopy && (
                          <button 
                            onClick={() => handleCopy(field.value, `${acc.id}-${fIdx}`)}
                            style={{ 
                              background: "none", border: "none", cursor: "pointer", 
                              color: copiedField === `${acc.id}-${fIdx}` ? "#10B981" : "var(--text-muted)", 
                              padding: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem"
                            }}
                          >
                            {copiedField === `${acc.id}-${fIdx}` ? <Check style={{ width: "14px", height: "14px" }} /> : <Copy style={{ width: "14px", height: "14px" }} />}
                            {copiedField === `${acc.id}-${fIdx}` ? "Đã copy" : "Copy"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleBackToHome} className="btn-primary" style={{ width: "100%", padding: "1rem", borderRadius: "12px", fontSize: "1rem" }}>
            Hoàn tất & Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  // ── PENDING PAYMENT STATE ───────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "2.5rem 0 5rem" }}>
      <div className="container-main animate-fade-in">
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontSize: "0.875rem" }}>
          <Link 
            href={buyNowItem ? `/san-pham/${buyNowItem.id}?type=${buyNowItem.product_type || 'account'}` : "/gio-hang"} 
            style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} /> {buyNowItem ? "Quay lại sản phẩm" : "Quay lại giỏ hàng"}
          </Link>
          <span style={{ color: "var(--text-light)" }}>/</span>
          <span style={{ color: "var(--text)", fontWeight: 600 }}>Thanh toán</span>
        </div>

        {/* Title */}
        <h1 className="text-gradient" style={{ fontSize: "2.25rem", fontWeight: 900, marginBottom: "1.5rem", letterSpacing: "-0.03em" }}>
          Thanh Toán Đơn Hàng
        </h1>

        {/* Error message alert */}
        {errorMessage && (
          <div style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1.5px solid #EF4444",
            borderRadius: "14px",
            padding: "1rem 1.25rem",
            marginBottom: "1.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#EF4444" }}>
              <XCircle style={{ width: 22, height: 22, flexShrink: 0 }} />
              <span style={{ fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.5 }}>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              style={{
                background: "rgba(239, 68, 68, 0.15)", color: "#EF4444", border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px", padding: "0.45rem 0.9rem",
                fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", whiteSpace: "nowrap"
              }}
            >
              Đóng
            </button>
          </div>
        )}

        {/* 2 Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "2.5rem", alignItems: "start" }} className="checkout-grid">
          
          {/* Left Column: Form & Payment methods */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Payment Method Card */}
            <div className="card" style={{ padding: "2rem", background: "var(--bg-card)", borderRadius: "18px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.25rem", color: "var(--text)" }}>
                Phương thức thanh toán
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Cổng VNPay */}
                <div
                  style={{
                    padding: "1.25rem 1.5rem",
                    borderRadius: "14px",
                    border: "2px solid #005BAA",
                    background: "rgba(0, 91, 170, 0.06)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem"
                  }}
                >
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    border: "2px solid #005BAA",
                    background: "#005BAA",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: "2px"
                  }}>
                    <Check style={{ width: 14, height: 14, color: "#fff", strokeWidth: 3 }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                      <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text)" }}>
                        💳 Cổng Thanh Toán Trực Tuyến VNPay
                      </span>
                      <span style={{
                        background: "#005BAA", color: "#fff",
                        fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: 99
                      }}>
                        Chính Thức
                      </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                      Hỗ trợ thanh toán nhanh chóng và bảo mật qua quét mã VNPAY-QR, ứng dụng Mobile Banking hoặc thẻ ATM nội địa.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Pay */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="card" style={{ padding: "1.75rem", background: "var(--bg-card)" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.25rem", borderBottom: "1.5px solid var(--border-light)", paddingBottom: "0.75rem" }}>
                Đơn Hàng Đang Mua
              </h2>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                {checkoutItems.map((item) => (
                  <div key={cartItemKey(item)} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: "52px", height: "40px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--border-light)", flexShrink: 0 }} 
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.825rem", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Sản phẩm duy nhất - {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider" style={{ marginBottom: "1.25rem" }} />

              {/* Pricing detail breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <span>Tạm tính</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{formatPrice(subtotal)}</span>
                </div>

                <div className="divider" />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "0.25rem" }}>
                  <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>Tổng thanh toán</span>
                  <span style={{ fontWeight: 900, fontSize: "1.45rem", color: "var(--primary)" }}>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Pay trigger button */}
              <button 
                onClick={handlePaymentConfirm}
                className="btn-primary" 
                style={{ 
                  width: "100%", padding: "1rem", fontSize: "1.05rem", 
                  borderRadius: "12px", display: "flex", alignItems: "center", 
                  justifyContent: "center", gap: "0.5rem",
                  boxShadow: "0 6px 24px rgba(0, 91, 170, 0.35)",
                  background: "linear-gradient(135deg, #005BAA, #0284C7)",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                <CreditCard style={{ width: "20px", height: "20px" }} />
                Tiến Hành Thanh Toán VNPay
              </button>
            </div>

            {/* Secures list */}
            <div className="card" style={{ padding: "1.25rem", background: "var(--bg-soft)", border: "1.5px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "var(--primary)", fontWeight: 700, fontSize: "0.875rem" }}>
                <ShieldCheck style={{ width: "18px", height: "18px" }} />
                Hệ Thống Thanh Toán Bảo Mật
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                GameAcc Shop sử dụng cổng thanh toán trực tuyến VNPay đảm bảo an toàn giao dịch 100%. Thông tin tài khoản, thẻ và giftcode sẽ được tự động giải phóng bàn giao ngay lập tức sau khi giao dịch thanh toán thành công.
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Premium Notification Modal */}
      {errorMessage && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10, 10, 18, 0.65)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          animation: "fadeIn 0.25s ease-out"
        }}>
          <div className="card animate-scale-up" style={{
            maxWidth: "450px",
            width: "90%",
            padding: "2.5rem 2rem",
            background: "var(--bg-card)",
            border: "1.5px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), 0 0 40px rgba(239, 68, 68, 0.08)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.25rem"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#EF4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)"
            }}>
              <XCircle style={{ width: "36px", height: "36px" }} />
            </div>

            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>
                Giao Dịch Thất Bại
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
                {errorMessage}
              </p>
            </div>

            <button
              onClick={() => setErrorMessage(null)}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "12px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #EF4444, #7C3AED)",
                border: "none",
                boxShadow: "0 6px 20px rgba(239, 68, 68, 0.25)",
                cursor: "pointer",
                color: "#fff"
              }}
            >
              Đóng & Thử lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
